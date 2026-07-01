import { eventBus } from '@click-india/shared-events';
import { auditService } from '@click-india/shared-audit';
import { TaskService } from './tasks';

export class EscalationService {
  public static async triggerEscalation(entityId: string, entityType: string, reason: string, priority: 'HIGH' | 'CRITICAL' = 'HIGH'): Promise<void> {
    eventBus.emit({
      type: 'EscalationTriggered',
      actor: { id: 'SYSTEM', type: 'SYSTEM' },
      payload: { entityId, entityType, reason, priority },
    });

    await auditService.log({
      actor_id: 'SYSTEM',
      actor_type: 'SYSTEM',
      action: 'ESCALATION_TRIGGERED',
      entity_type: entityType,
      entity_id: entityId,
      metadata: { reason, priority },
    });

    // Automatically create a high-priority task for human intervention
    await TaskService.createTask({
      title: `ESCALATION: ${reason}`,
      description: `Automatic escalation for ${entityType} ${entityId} due to: ${reason}`,
      entity_type: entityType as any,
      entity_id: entityId,
      status: 'CREATED',
      priority: priority === 'CRITICAL' ? 'CRITICAL' : 'HIGH',
    });
  }

  public static async checkPendingDocuments(leadId: string, docCount: number, daysPending: number): Promise<void> {
    if (docCount > 0 && daysPending >= 3) {
      await this.triggerEscalation(leadId, 'LEAD', `Documents pending for ${daysPending} days`, 'HIGH');
    }
  }

  public static async checkInactivity(customerId: string, daysInactive: number): Promise<void> {
    if (daysInactive >= 7) {
      await this.triggerEscalation(customerId, 'CUSTOMER', `Customer inactive for ${daysInactive} days`, 'MEDIUM' as any);
      
      eventBus.emit({
        type: 'EngagementDecayDetected',
        actor: { id: 'SYSTEM', type: 'SYSTEM' },
        payload: { customerId, daysInactive },
      });
    }
  }
}
