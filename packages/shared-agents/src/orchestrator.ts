import { eventBus } from '@click-india/shared-events';
import { EcosystemEvent } from '@click-india/shared-types';
import { BaseAgent } from './base-agent';

export class AgentOrchestrator {
  private static instance: AgentOrchestrator;
  private agents: BaseAgent[] = [];
  private isRunning: boolean = false;

  private constructor() {}

  public static getInstance(): AgentOrchestrator {
    if (!AgentOrchestrator.instance) {
      AgentOrchestrator.instance = new AgentOrchestrator();
    }
    return AgentOrchestrator.instance;
  }

  public registerAgent(agent: BaseAgent): void {
    this.agents.push(agent);
    console.log(`[AgentOrchestrator] Registered agent: ${agent.identity.name}`);
  }

  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;

    // Subscribe to ALL events
    eventBus.subscribe('*' as any, (event: EcosystemEvent) => {
      this.routeEvent(event);
    });

    console.log('[AgentOrchestrator] Agent orchestration layer started.');
  }

  private routeEvent(event: EcosystemEvent): void {
    const compatibleAgents = this.agents.filter(agent => agent.canHandle(event));
    const AGENT_TIMEOUT = 5000; // 5 seconds
    
    compatibleAgents.forEach(agent => {
      // Basic Circuit Breaker check (hypothetical, simplified)
      if ((agent as any).failureCount > 5) {
        console.error(`[AgentOrchestrator] Circuit open for agent: ${agent.identity.name}. Skipping.`);
        return;
      }

      // Execute agents with timeout protection
      const executionPromise = agent.handle(event);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Agent execution timeout')), AGENT_TIMEOUT)
      );

      Promise.race([executionPromise, timeoutPromise])
        .catch(error => {
          console.error(`[AgentOrchestrator] Execution failed for ${agent.identity.name}:`, error);
          (agent as any).failureCount = ((agent as any).failureCount || 0) + 1;
        });
    });
  }

  public getActiveAgents(): BaseAgent[] {
    return this.agents;
  }
}

export const agentOrchestrator = AgentOrchestrator.getInstance();
