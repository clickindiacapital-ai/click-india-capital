import { BaseAgent } from '../base-agent';
import { AgentIdentity, AgentRecommendation, EcosystemEvent } from '@click-india/shared-types';

export class ConsultationSummaryAgent extends BaseAgent {
  public identity: AgentIdentity = {
    id: 'agent_consultation_summary_01',
    name: 'Consultation Summary Agent',
    version: '1.0.0',
    description: 'Summarizes consultations and extracts debt categories.',
    capabilities: ['SUMMARY', 'CLASSIFICATION']
  };

  public canHandle(event: EcosystemEvent): boolean {
    return event.type === 'ConsultationCompleted';
  }

  protected async analyze(event: EcosystemEvent): Promise<Omit<AgentRecommendation, 'id' | 'agent_id' | 'trigger_event_id' | 'created_at' | 'status'> | null> {
    const { leadId, intelligence } = event.payload;

    // Simulate AI analysis logic
    const summary = `Customer reported high stress due to ${intelligence.debt_categories.join(', ')}. EMI burden is ${intelligence.emi_burden}%.`;
    
    return {
      entity_type: 'LEAD',
      entity_id: leadId,
      recommendation_type: 'SUMMARY',
      content: {
        summary,
        suggested_notes: `[AI SUMMARY] ${summary}`,
        extracted_pain_points: intelligence.pain_points
      },
      confidence: 0.92,
      reasoning: 'Extracted directly from consultation intelligence metadata.'
    };
  }
}
