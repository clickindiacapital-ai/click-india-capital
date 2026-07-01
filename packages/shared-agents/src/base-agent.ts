import { AgentIdentity, AgentRecommendation, AgentStatus, EcosystemEvent } from '@click-india/shared-types';
import { eventBus } from '@click-india/shared-events';
import { auditService } from '@click-india/shared-audit';

export abstract class BaseAgent {
  public abstract identity: AgentIdentity;
  protected status: AgentStatus = 'IDLE';

  constructor() {}

  public abstract canHandle(event: EcosystemEvent): boolean;
  
  public async handle(event: EcosystemEvent): Promise<void> {
    this.status = 'ANALYZING';
    
    try {
      const recommendation = await this.analyze(event);
      if (recommendation) {
        this.status = 'RECOMMENDING';
        await this.propose(recommendation);
      }
      this.status = 'COMPLETED';
    } catch (error) {
      this.status = 'ERROR';
      console.error(`Agent ${this.identity.name} failed:`, error);
      await auditService.log({
        actor_id: this.identity.id,
        actor_type: 'AI_AGENT',
        action: 'AGENT_ERROR',
        entity_type: 'AGENT',
        entity_id: this.identity.id,
        metadata: { error: String(error), eventId: event.id }
      });
    } finally {
      this.status = 'IDLE';
    }
  }

  protected abstract analyze(event: EcosystemEvent): Promise<Omit<AgentRecommendation, 'id' | 'agent_id' | 'trigger_event_id' | 'created_at' | 'status'> | null>;

  protected async propose(recommendation: Omit<AgentRecommendation, 'id' | 'agent_id' | 'trigger_event_id' | 'created_at' | 'status'>): Promise<void> {
    const fullRecommendation: AgentRecommendation = {
      ...recommendation,
      id: crypto.randomUUID(),
      agent_id: this.identity.id,
      trigger_event_id: 'internal', // Would be the event that triggered this
      created_at: new Date().toISOString(),
      status: 'PENDING'
    };

    // Log to Audit
    await auditService.log({
      actor_id: this.identity.id,
      actor_type: 'AI_AGENT',
      action: 'AGENT_RECOMMENDATION_PROPOSED',
      entity_type: fullRecommendation.entity_type,
      entity_id: fullRecommendation.entity_id,
      new_state: fullRecommendation,
      metadata: { reasoning: fullRecommendation.reasoning }
    });

    // Emit event for UI updates
    eventBus.emit({
      type: 'IntelligenceUpdated',
      actor: { id: this.identity.id, type: 'AI_AGENT' },
      payload: fullRecommendation
    });
  }
}
