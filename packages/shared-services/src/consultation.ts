import { supabase } from './supabase';
import { ConsultationIntelligence } from '@click-india/shared-types';
import { eventBus } from '@click-india/shared-events';
import { auditService } from '@click-india/shared-audit';

export class ConsultationService {
  public static async recordConsultation(leadId: string, intelligence: ConsultationIntelligence): Promise<void> {
    const { error } = await supabase
      .from('consultations')
      .upsert({
        lead_id: leadId,
        ...intelligence,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Error recording consultation intelligence:', error);
      return;
    }

    eventBus.emit({
      type: 'ConsultationCompleted',
      actor: { id: 'SYSTEM', type: 'SYSTEM' },
      payload: { leadId, intelligence },
    });

    await auditService.log({
      actor_id: 'SYSTEM',
      actor_type: 'SYSTEM',
      action: 'CONSULTATION_INTELLIGENCE_RECORDED',
      entity_type: 'LEAD',
      entity_id: leadId,
      new_state: intelligence,
    });
  }

  public static async getConsultationIntelligence(leadId: string): Promise<ConsultationIntelligence | null> {
    const { data, error } = await supabase
      .from('consultations')
      .select('*')
      .eq('lead_id', leadId)
      .single();

    if (error || !data) return null;
    return data as ConsultationIntelligence;
  }
}
