import { LeadData, IntelligenceMetrics, CustomerLifecycleState } from '@click-india/shared-types';
import { eventBus } from '@click-india/shared-events';
import { auditService } from '@click-india/shared-audit';

export class IntelligenceService {
  public static calculateIntelligenceMetrics(lead: LeadData): IntelligenceMetrics {
    // Priority Score: Based on lead score and urgency
    const urgencyMap: Record<string, number> = {
      'within_week': 30,
      'within_month': 15,
      'just_exploring': 5
    };
    const priority_score = Math.min(100, lead.lead_score + (urgencyMap[lead.urgency || ''] || 0));

    // Engagement Score: Placeholder for now, would be based on interaction frequency
    const engagement_score = 100; // Default for new leads

    // Retention Score: Placeholder, based on relationship length and feedback
    const retention_score = 50;

    // Urgency Score: Based on metadata stress level
    const stressMap: Record<string, number> = {
      'CRITICAL': 90,
      'HIGH': 70,
      'MEDIUM': 40,
      'LOW': 10
    };
    const urgency_score = stressMap[lead.metadata?.stress_level] || 30;

    return {
      priority_score,
      engagement_score,
      retention_score,
      urgency_score,
      last_updated: new Date().toISOString(),
    };
  }

  public static async updateIntelligence(leadId: string, metrics: IntelligenceMetrics): Promise<void> {
    eventBus.emit({
      type: 'IntelligenceUpdated',
      actor: { id: 'SYSTEM', type: 'SYSTEM' },
      payload: { leadId, metrics },
    });

    await auditService.log({
      actor_id: 'SYSTEM',
      actor_type: 'SYSTEM',
      action: 'INTELLIGENCE_UPDATED',
      entity_type: 'LEAD',
      entity_id: leadId,
      new_state: metrics,
    });
  }

  public static inferLifecycleState(lead: LeadData): CustomerLifecycleState {
    if (lead.status === 'NEW_LEAD') return 'NEW_ENQUIRY';
    if (lead.metadata?.stress_level === 'CRITICAL') return 'HIGH_STRESS_CUSTOMER';
    if (lead.status === 'CONSULTATION_SCHEDULED' || lead.status === 'CONSULTATION_COMPLETED') return 'CONSULTATION_ACTIVE';
    if (lead.status === 'BLUEPRINT_GENERATED') return 'BLUEPRINT_IN_PROGRESS';
    if (lead.status === 'EXECUTION_IN_PROGRESS') return 'EXECUTION_STAGE';
    if (lead.status === 'DISBURSED') return 'LONG_TERM_RELATIONSHIP';
    
    return 'NEW_ENQUIRY';
  }
}

export const intelligenceService = IntelligenceService;
