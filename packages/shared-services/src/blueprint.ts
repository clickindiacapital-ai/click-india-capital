import { getSupabase } from './supabase';

export interface StrategyBlueprint {
  lead_id: string;
  strategy_summary: string;
  settlement_targets: {
    creditor: string;
    total_due: number;
    target_settlement: number;
    savings: number;
  }[];
  refinance_plan: {
    asset_name: string;
    current_roi: number;
    target_roi: number;
    monthly_savings: number;
  };
  rehabilitation_timeline: string[]; // Step 1, Step 2, etc.
}

export const blueprintService = {
  // 1. CALCULATE STRATEGY (The AI Suggestion)
  async calculateSuggestedStrategy(leadId: string) {
    const client = getSupabase();
    const { data: lead } = await client.from('loan_leads').select('*, customer_profiles(*)').eq('id', leadId).single();

    if (!lead) throw new Error('Lead not found');

    const totalEMI = lead.metadata?.totalEMI || 0;
    
    return {
      suggested_settlement_roi: 0.4, // Suggest 40% settlement
      potential_monthly_savings: totalEMI * 0.35,
      timeline_months: 6
    };
  },

  // 2. SAVE FINAL BLUEPRINT (The ₹1500 Product)
  async saveBlueprint(blueprint: StrategyBlueprint) {
    const client = getSupabase();
    
    // Save to database
    const { data, error } = await client
      .from('financial_blueprints')
      .insert([{
        lead_id: blueprint.lead_id,
        strategy_summary: blueprint.strategy_summary,
        recommended_settlements: blueprint.settlement_targets,
        refinance_plan: blueprint.refinance_plan,
        is_published: true
      }])
      .select()
      .single();

    if (error) throw error;

    // Trigger Notification to Customer
    await client.from('notifications').insert([{
      user_id: (await client.from('loan_leads').select('customer_id').eq('id', blueprint.lead_id).single()).data?.customer_id,
      title: 'Your Strategy Blueprint is Ready!',
      message: 'Click to view your professional debt recovery roadmap.',
      notification_type: 'BLUEPRINT_READY'
    }]);

    return data;
  },

  // 3. GET BLUEPRINT FOR CUSTOMER
  async getBlueprintByLead(leadId: string) {
    const client = getSupabase();
    return await client
      .from('financial_blueprints')
      .select('*')
      .eq('lead_id', leadId)
      .eq('is_published', true)
      .single();
  }
};
