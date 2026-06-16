import { getSupabase } from './supabase';
import { CustomerMessage, LeadData } from '@click-india/shared-types';

export const leadService = {
  getAllLeads: async () => {
    const supabase = getSupabase();
    return supabase.from('leads').select('*').order('created_at', { ascending: false });
  },
  updateLead: async (id: string, updates: any) => {
    const supabase = getSupabase();
    return supabase.from('leads').update(updates).eq('id', id).select().single();
  }
};

export const communicationService = {
  getUnreadSummaries: async () => {
    const supabase = getSupabase();
    // In a real app this would be an RPC call or complex query. For now, we fetch all unread messages and group them.
    const { data, error } = await supabase
      .from('customer_messages')
      .select('lead_id, message_priority')
      .eq('is_read', false)
      .eq('sender_type', 'CUSTOMER');
      
    if (error) return { data: null, error };
    
    const summaries = (data || []).reduce((acc: any, msg) => {
      const existing = acc.find((s: any) => s.lead_id === msg.lead_id);
      const priorityVal = msg.message_priority === 'EMERGENCY' ? 3 : msg.message_priority === 'URGENT' ? 2 : 1;
      
      if (existing) {
        existing.unread_count += 1;
        existing.peak_priority_level = Math.max(existing.peak_priority_level, priorityVal);
      } else {
        acc.push({
          lead_id: msg.lead_id,
          unread_count: 1,
          peak_priority_level: priorityVal
        });
      }
      return acc;
    }, []);
    
    return { data: summaries, error: null };
  },
  
  getMessagesForLead: async (leadId: string) => {
    const supabase = getSupabase();
    return supabase
      .from('customer_messages')
      .select('*')
      .eq('lead_id', leadId)
      .order('created_at', { ascending: true });
  },
  
  markAsRead: async (messageIds: string[]) => {
    const supabase = getSupabase();
    return supabase
      .from('customer_messages')
      .update({ is_read: true })
      .in('id', messageIds);
  },
  
  sendMessage: async (message: Omit<CustomerMessage, 'id' | 'created_at' | 'is_read'>) => {
    const supabase = getSupabase();
    return supabase
      .from('customer_messages')
      .insert([message as any])
      .select()
      .single();
  }
};

export const paymentService = {
  getPendingVerifications: async () => {
    return { data: [] }; // Stub for now
  },
  verifyManualPayment: async (_submissionId: string, _status: string, _adminId: string) => {
    return { data: null }; // Stub for now
  }
};

export const customerService = {
  getAllCustomers: async () => {
    const supabase = getSupabase();
    return supabase.from('customers').select('*').order('created_at', { ascending: false });
  },
  getCustomerById: async (id: string) => {
    const supabase = getSupabase();
    return supabase.from('customers').select('*').eq('id', id).single();
  },
  createCustomer: async (customer: any) => {
    const supabase = getSupabase();
    return supabase.from('customers').insert([customer]).select().single();
  },
  updateCustomer: async (id: string, updates: any) => {
    const supabase = getSupabase();
    return supabase.from('customers').update(updates).eq('id', id).select().single();
  },
  getTimeline: async (customerId: string) => {
    const supabase = getSupabase();
    return supabase.from('customer_timeline').select('*').eq('customer_id', customerId).order('event_date', { ascending: false });
  },
  addTimelineEvent: async (event: any) => {
    const supabase = getSupabase();
    return supabase.from('customer_timeline').insert([event]).select().single();
  },
  getConsultations: async (customerId: string) => {
    const supabase = getSupabase();
    return supabase.from('consultations').select('*').eq('customer_id', customerId).order('created_at', { ascending: false });
  },
  getDocuments: async (customerId: string) => {
    const supabase = getSupabase();
    return supabase.from('customer_documents').select('*').eq('customer_id', customerId).order('uploaded_at', { ascending: false });
  }
};

// Leave the rest as dummies
export const aiService = {};
export const blueprintService = {};
export const intelligenceService = {};
export const AgentActionCenter = {};
export const UptimeService = {};
export const analyticsService = {};
export const settlementService = {};
export const outreachService = {};
