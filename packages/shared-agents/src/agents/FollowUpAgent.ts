import { BaseAgent } from '../base-agent';
import { AgentIdentity, AgentRecommendation, EcosystemEvent } from '@click-india/shared-types';

export class FollowUpAgent extends BaseAgent {
  public identity: AgentIdentity = {
    id: 'agent_followup_orchestrator_01',
    name: 'Follow-up Orchestration Agent',
    version: '1.0.0',
    description: 'Recommends follow-up actions for inactive or missed events.',
    capabilities: ['FOLLOW_UP', 'ESCALATION']
  };

  public canHandle(event: EcosystemEvent): boolean {
    return event.type === 'CustomerInactive' || event.type === 'EngagementDecayDetected';
  }

  protected async analyze(event: EcosystemEvent): Promise<Omit<AgentRecommendation, 'id' | 'agent_id' | 'trigger_event_id' | 'created_at' | 'status'> | null> {
    const { customerId, daysInactive } = event.payload;

    if (daysInactive >= 7) {
      return {
        entity_type: 'CUSTOMER',
        entity_id: customerId,
        recommendation_type: 'FOLLOW_UP',
        content: {
          action: 'SCHEDULE_CALL',
          message_draft: 'Hi, we noticed you haven\'t checked your rehab progress lately. Need help?',
          urgency: 'HIGH'
        },
        confidence: 0.85,
        reasoning: `Customer inactive for ${daysInactive} days exceeds critical engagement threshold.`
      };
    }

    return null;
  }
}
