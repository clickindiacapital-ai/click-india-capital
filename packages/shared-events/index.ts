export type EcosystemEventType =
  | 'LeadCreated'
  | 'DiagnosisStarted'
  | 'DiagnosisCompleted'
  | 'ConsultationScheduled'
  | 'ConsultationCompleted'
  | 'BlueprintGenerated'
  | 'AssetUploaded'
  | 'DocumentMissing'
  | 'MarketplaceOpportunityCreated'
  | 'CustomerInactive'
  | 'NotificationTriggered'
  | 'RefinanceEligible'
  | 'TaskCreated'
  | 'TaskUpdated'
  | 'StateTransition'
  | 'LifecycleStateChanged'
  | 'IntelligenceUpdated'
  | 'EscalationTriggered'
  | 'EngagementDecayDetected';

export interface EcosystemEvent<T = any> {
  id: string;
  type: EcosystemEventType;
  timestamp: string;
  actor: {
    id: string;
    type: 'USER' | 'SYSTEM' | 'AI_AGENT';
  };
  payload: T;
  traceId?: string;
  metadata?: Record<string, any>;
}

type EventCallback<T = any> = (event: EcosystemEvent<T>) => void;

class EventBus {
  private static instance: EventBus;
  private subscribers: Map<string, EventCallback[]> = new Map();
  private seenEvents: Set<string> = new Set(); // For duplication detection
  private readonly MAX_SEEN_EVENTS = 1000;

  private constructor() {}

  public static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  public subscribe<T = any>(type: EcosystemEventType, callback: EventCallback<T>): () => void {
    const callbacks = this.subscribers.get(type) || [];
    callbacks.push(callback);
    this.subscribers.set(type, callbacks);

    return () => {
      const updatedCallbacks = this.subscribers.get(type)?.filter(cb => cb !== callback) || [];
      this.subscribers.set(type, updatedCallbacks);
    };
  }

  public emit<T = any>(event: Omit<EcosystemEvent<T>, 'id' | 'timestamp'>, retryCount = 0): void {
    const fullEvent: EcosystemEvent<T> = {
      ...event,
      id: (event as any).id || crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    };

    // Duplication Detection
    if (this.seenEvents.has(fullEvent.id)) {
      console.warn(`[EventBus] Duplicate event detected and dropped: ${fullEvent.id}`);
      return;
    }
    this.seenEvents.add(fullEvent.id);
    if (this.seenEvents.size > this.MAX_SEEN_EVENTS) {
      const firstItem = this.seenEvents.values().next().value;
      this.seenEvents.delete(firstItem);
    }

    const callbacks = this.subscribers.get(event.type) || [];
    const wildcardCallbacks = this.subscribers.get('*') || [];
    const allCallbacks = [...callbacks, ...wildcardCallbacks];

    allCallbacks.forEach(cb => {
      try {
        cb(fullEvent);
      } catch (error) {
        console.error(`[EventBus] Error in subscriber for ${event.type}:`, error);
        
        // Simple Retry Logic for failed subscribers
        if (retryCount < 2) {
          console.log(`[EventBus] Retrying event ${fullEvent.id} (Attempt ${retryCount + 1})`);
          setTimeout(() => this.emit(event, retryCount + 1), 1000 * (retryCount + 1));
        }
      }
    });
  }
}

export const eventBus = EventBus.getInstance();
