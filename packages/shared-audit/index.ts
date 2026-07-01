export interface AuditLogEntry {
  id: string;
  actor_id: string;
  actor_type: 'USER' | 'SYSTEM' | 'AI_AGENT';
  action: string;
  entity_type: string;
  entity_id: string;
  previous_state?: any;
  new_state?: any;
  timestamp: string;
  metadata?: Record<string, any>;
  trace_id?: string;
}

export class AuditService {
  private static instance: AuditService;
  private persistenceProvider?: (entry: AuditLogEntry) => Promise<void>;

  private constructor() {}

  public static getInstance(): AuditService {
    if (!AuditService.instance) {
      AuditService.instance = new AuditService();
    }
    return AuditService.instance;
  }

  public setPersistence(provider: (entry: AuditLogEntry) => Promise<void>) {
    this.persistenceProvider = provider;
  }

  public static readonly SYSTEM_ID = '00000000-0000-0000-0000-000000000000';
  public static readonly AGENT_ID = 'ffffffff-ffff-ffff-ffff-ffffffffffff';

  public async log(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): Promise<void> {
    const actorId = entry.actor_id || (entry.actor_type === 'SYSTEM' ? AuditService.SYSTEM_ID : AuditService.AGENT_ID);
    
    const fullEntry: AuditLogEntry = {
      ...entry,
      actor_id: actorId,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    };

    if (this.persistenceProvider) {
      await this.persistenceProvider(fullEntry);
    } else {
      console.log('[AUDIT LOG - No Persistence]', JSON.stringify(fullEntry, null, 2));
    }
  }
}

export const auditService = AuditService.getInstance();
