import { supabase } from './supabase';
import { AgentRecommendation } from '@click-india/shared-types';
import { auditService } from '@click-india/shared-audit';
import { eventBus } from '@click-india/shared-events';

export class AgentActionCenter {
  public static async getPendingRecommendations(): Promise<AgentRecommendation[]> {
    const { data, error } = await supabase
      .from('agent_recommendations')
      .select('*')
      .eq('status', 'PENDING')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  public static async approveRecommendation(recommendationId: string, actorId: string): Promise<void> {
    const { data: rec, error: fetchError } = await supabase
      .from('agent_recommendations')
      .select('*')
      .eq('id', recommendationId)
      .single();

    if (fetchError || !rec) throw new Error('Recommendation not found');

    const { error } = await supabase
      .from('agent_recommendations')
      .update({ status: 'APPROVED', updated_at: new Date().toISOString() })
      .eq('id', recommendationId);

    if (error) throw error;

    await auditService.log({
      actor_id: actorId,
      actor_type: 'USER',
      action: 'AGENT_RECOMMENDATION_APPROVED',
      entity_type: rec.entity_type,
      entity_id: rec.entity_id,
      metadata: { recommendation_id: recommendationId, agent_id: rec.agent_id }
    });

    eventBus.emit({
      type: 'TaskUpdated',
      actor: { id: actorId, type: 'USER' },
      payload: { recommendationId, status: 'APPROVED' }
    });
  }

  public static async rejectRecommendation(recommendationId: string, actorId: string, reason: string): Promise<void> {
    const { data: rec } = await supabase
      .from('agent_recommendations')
      .select('*')
      .eq('id', recommendationId)
      .single();

    const { error } = await supabase
      .from('agent_recommendations')
      .update({ status: 'REJECTED', updated_at: new Date().toISOString(), metadata: { rejection_reason: reason } })
      .eq('id', recommendationId);

    if (error) throw error;

    await auditService.log({
      actor_id: actorId,
      actor_type: 'USER',
      action: 'AGENT_RECOMMENDATION_REJECTED',
      entity_type: rec.entity_type,
      entity_id: rec.entity_id,
      metadata: { recommendation_id: recommendationId, reason }
    });
  }
}
