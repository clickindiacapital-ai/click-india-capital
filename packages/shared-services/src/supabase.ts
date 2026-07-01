import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { LeadStatus } from '@click-india/shared-types';
import { CommunicationService } from './communication';
import { NotificationService } from './notifications';

export let supabase: SupabaseClient;

export let communicationService: CommunicationService;
export let notificationService: NotificationService;

export const initSupabase = (url: string, key: string, options?: any) => {
  if (!supabase) {
    supabase = createClient(url, key, options);
    communicationService = new CommunicationService(url, key);
    notificationService = new NotificationService(url, key);
    
    // Initialize Audit Service Persistence
    import('@click-india/shared-audit').then(({ auditService }) => {
      auditService.setPersistence(async (entry) => {
        await supabase.from('audit_logs').insert([entry]);
      });
    });
  }
  return supabase;
};

export const getSupabase = () => {
  if (!supabase) {
    throw new Error('Supabase not initialized. Call initSupabase() first.');
  }
  return supabase;
};

// Export services that use the client
export const authService = {
  async signInWithOtp(phone: string) {
    const client = getSupabase();
    return await client.auth.signInWithOtp({
      phone,
      options: { shouldCreateUser: true }
    });
  },
  async verifyOtp(phone: string, token: string) {
    const client = getSupabase();
    return await client.auth.verifyOtp({
      phone,
      token,
      type: 'sms'
    });
  },
  async signOut() {
    return await getSupabase().auth.signOut();
  }
};

export const leadService = {
  async createLead(leadData: any) {
    const client = getSupabase();
    const { SecurityUtils } = await import('@click-india/shared-utils');

    // Rate Limiting
    if (SecurityUtils.isRateLimited(`create_lead_${leadData.phone}`)) {
      return { error: 'Request throttled. Please try again later.' };
    }

    // Input Sanitization
    const sanitizedPhone = SecurityUtils.sanitizeString(leadData.phone);
    if (!SecurityUtils.validatePhone(sanitizedPhone)) {
      return { error: 'Invalid phone format detected.' };
    }

    const insertData = {
      customer_id: leadData.customer_id || null,
      loan_type: leadData.loan_type,
      loan_amount: leadData.loan_amount,
      status: leadData.status || 'NEW',
      debt_stress_level: leadData.urgency || 'MEDIUM',
      metadata: {
        phone: sanitizedPhone,
        monthly_income: leadData.monthly_income,
        employment_type: leadData.employment_type,
        city: leadData.city,
        lead_score: leadData.lead_score,
        ...leadData.metadata
      }
    };

    const { data, error } = await client.from('loan_leads').insert([insertData]).select().single();
    
    if (data && !error) {
      const { eventBus } = await import('@click-india/shared-events');
      const { auditService } = await import('@click-india/shared-audit');

      eventBus.emit({
        type: 'LeadCreated',
        actor: { id: leadData.customer_id || 'SYSTEM', type: leadData.customer_id ? 'USER' : 'SYSTEM' },
        payload: data,
      });

      await auditService.log({
        actor_id: leadData.customer_id || 'SYSTEM',
        actor_type: leadData.customer_id ? 'USER' : 'SYSTEM',
        action: 'LEAD_CREATED',
        entity_type: 'LEAD',
        entity_id: data.id,
        new_state: data,
      });

      // Trigger Operational Alert (PHASE 9)
      await notificationService.dispatchOperationalAlert(
        'NEW_LEAD',
        `New ${data.loan_type} lead from ${sanitizedPhone}`,
        { lead_id: data.id }
      );
    }

    return { data, error };
  },

  async updateLeadStatus(leadId: string, newStatus: LeadStatus, actorId: string) {
    const client = getSupabase();
    const { data: lead } = await client.from('loan_leads').select('status').eq('id', leadId).single();

    if (!lead) return { error: 'Lead not found' };

    const { GovernanceEngine } = await import('@click-india/shared-governance');
    if (!GovernanceEngine.isValidLeadTransition(lead.status, newStatus)) {
      return { error: `Invalid transition from ${lead.status} to ${newStatus}` };
    }

    const { data, error } = await client
      .from('loan_leads')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', leadId)
      .select()
      .single();

    if (data && !error) {
      const { eventBus } = await import('@click-india/shared-events');
      const { auditService } = await import('@click-india/shared-audit');

      eventBus.emit({
        type: 'StateTransition',
        actor: { id: actorId, type: 'USER' },
        payload: { leadId, from: lead.status, to: newStatus },
      });

      await auditService.log({
        actor_id: actorId,
        actor_type: 'USER',
        action: 'LEAD_STATUS_UPDATED',
        entity_type: 'LEAD',
        entity_id: leadId,
        previous_state: lead.status,
        new_state: newStatus,
      });
    }

    return { data, error };
  },

  async getMyLeads(customerId: string) {
    const client = getSupabase();
    return await client.from('loan_leads').select('*').eq('customer_id', customerId);
  },
  async getAllLeads() {
    const client = getSupabase();
    return await client.from('loan_leads').select('*').order('created_at', { ascending: false });
  }
};

export const assetService = {
  async getMyAssets(ownerId: string) {
    const client = getSupabase();
    return await client.from('assets').select('*').eq('owner_id', ownerId);
  },
  async addAsset(assetData: any) {
    const client = getSupabase();
    const { data, error } = await client.from('assets').insert([assetData]).select().single();
    
    if (data && !error) {
      const { eventBus } = await import('@click-india/shared-events');
      const { auditService } = await import('@click-india/shared-audit');

      eventBus.emit({
        type: 'AssetUploaded',
        actor: { id: assetData.owner_id, type: 'USER' },
        payload: data,
      });

      await auditService.log({
        actor_id: assetData.owner_id,
        actor_type: 'USER',
        action: 'ASSET_UPLOADED',
        entity_type: 'ASSET',
        entity_id: data.id,
        new_state: data,
      });
    }

    return { data, error };
  },

  async detectOpportunities(assetId: string) {
    const client = getSupabase();
    const { data: asset } = await client.from('assets').select('*').eq('id', assetId).single();
    
    if (!asset) return null;

    const opportunities = [];
    
    // Logic for Refinance Opportunity
    if (asset.type === 'VEHICLE' && asset.value > 500000) {
      opportunities.push({
        type: 'REFINANCE',
        reason: 'High-value vehicle eligible for lower-interest top-up loan',
        potential_savings: '₹2,500/month'
      });
    }

    // Logic for Marketplace Opportunity
    if (asset.type === 'PROPERTY') {
      opportunities.push({
        type: 'MARKETPLACE',
        reason: 'Property demand high in your area. Eligible for instant listing.',
      });
    }

    return opportunities;
  }
};


export const auditLogService = {
  async createAuditLog(logEntry: any) {
    const client = getSupabase();
    return await client.from('audit_logs').insert([logEntry]);
  },
  async getAuditLogs(entityType?: string, entityId?: string) {
    const client = getSupabase();
    let query = client.from('audit_logs').select('*').order('timestamp', { ascending: false });
    if (entityType) query = query.eq('entity_type', entityType);
    if (entityId) query = query.eq('entity_id', entityId);
    return await query;
  }
};
