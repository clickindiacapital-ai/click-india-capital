import { BaseAgent } from '../base-agent';
import { AgentIdentity, AgentRecommendation, EcosystemEvent } from '@click-india/shared-types';

export class PrioritizationAgent extends BaseAgent {
  public identity: AgentIdentity = {
    id: 'agent_crm_prioritization_01',
    name: 'CRM Prioritization Agent',
    version: '1.0.0',
    description: 'Ranks leads based on operational urgency and retention value.',
    capabilities: ['PRIORITIZATION']
  };

  public canHandle(event: EcosystemEvent): boolean {
    return event.type === 'LeadCreated' || event.type === 'LifecycleStateChanged';
  }

  protected async analyze(event: EcosystemEvent): Promise<Omit<AgentRecommendation, 'id' | 'agent_id' | 'trigger_event_id' | 'created_at' | 'status'> | null> {
    const payload = event.payload;
    const leadId = payload.id || payload.leadId;

    if (!leadId) return null;

    return {
      entity_type: 'LEAD',
      entity_id: leadId,
      recommendation_type: 'PRIORITIZATION',
      content: {
        suggested_priority: payload.stress_level === 'CRITICAL' ? 'URGENT' : 'NORMAL',
        reason: 'Automatic ranking based on stress metadata and lifecycle state.'
      },
      confidence: 0.88,
      reasoning: 'Operational heuristics applied to lead metadata.'
    };
  }
}
