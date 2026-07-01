import { getSupabase } from './supabase';

export type EventType = 
  | 'DIAGNOSIS_STARTED' 
  | 'DIAGNOSIS_COMPLETED' 
  | 'PAYMENT_49_SUCCESS' 
  | 'BLUEPRINT_GENERATED' 
  | 'ASSET_UPLOADED'
  | 'REFINANCE_OFFER_CLICKED';

export const analyticsService = {
  // 1. TRACK EVENT (Cross-Platform)
  async trackEvent(userId: string | undefined, eventType: EventType, metadata: Record<string, any> = {}, sessionId?: string) {
    const client = getSupabase();
    
    const { error } = await client.from('analytics_events').insert([{
      user_id: userId,
      event_type: eventType,
      metadata,
      session_id: sessionId,
      timestamp: new Date().toISOString()
    }]);

    if (error) console.error('[ANALYTICS_ERROR]', error);
  },

  // 2. GET FUNNEL METRICS (Real-time for CRM)
  async getTransformationFunnel() {
    const client = getSupabase();
    
    // In production, these would be cached or pre-aggregated
    const events = ['DIAGNOSIS_STARTED', 'DIAGNOSIS_COMPLETED', 'PAYMENT_49_SUCCESS', 'BLUEPRINT_GENERATED'];
    
    const funnel: Record<string, number> = {};
    
    await Promise.all(events.map(async (event) => {
      const { count } = await client
        .from('analytics_events')
        .select('*', { count: 'exact', head: true })
        .eq('event_type', event);
      funnel[event.toLowerCase()] = count || 0;
    }));

    return {
      diagnosis: funnel['diagnosis_started'] || 0,
      completed_diagnosis: funnel['diagnosis_completed'] || 0,
      paid_diagnosis: funnel['payment_49_success'] || 0,
      strategy_blueprints: funnel['blueprint_generated'] || 0,
    };
  },

  // 3. TRACK IMPACT
  async trackDebtSaved(leadId: string, amount: number) {
    const client = getSupabase();
    return await client.from('crm_activities').insert([{
      lead_id: leadId,
      action_type: 'IMPACT_SAVINGS_IDENTIFIED',
      notes: `Identified ₹${amount} in potential monthly savings.`
    }]);
  }
};
