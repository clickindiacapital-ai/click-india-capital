import { createClient } from '@supabase/supabase-js';
import { CustomerMessage, MessagePriority, MessageType, SenderType } from '@click-india/shared-types';
import { auditService } from '@click-india/shared-audit';
import { eventBus } from '@click-india/shared-events';

export class CommunicationService {
  private supabase;

  constructor(url: string, key: string) {
    this.supabase = createClient(url, key);
  }

  public async sendMessage(message: Omit<CustomerMessage, 'id' | 'created_at' | 'is_read' | 'escalation_state'>): Promise<{ data: CustomerMessage | null, error: any }> {
    const { data, error } = await this.supabase
      .from('customer_messages')
      .insert([{
        ...message,
        is_read: false,
        escalation_state: 'NONE'
      }])
      .select()
      .single();

    if (data) {
      // Log to Audit
      await auditService.log({
        actor_id: message.sender_id || 'SYSTEM',
        actor_type: message.sender_type === 'CUSTOMER' ? 'USER' : 'AI_AGENT',
        action: 'MESSAGE_SENT',
        entity_type: 'LEAD',
        entity_id: message.lead_id || message.customer_id,
        metadata: { priority: message.message_priority, type: message.message_type }
      });

      // Emit event for real-time UI alerts
      eventBus.emit({
        type: 'MessageReceived',
        actor: { id: message.sender_id || 'SYSTEM', type: message.sender_type },
        payload: data
      });
    }

    return { data, error };
  }

  public async getMessagesForLead(leadId: string): Promise<{ data: CustomerMessage[] | null, error: any }> {
    return await this.supabase
      .from('customer_messages')
      .select('*')
      .eq('lead_id', leadId)
      .order('created_at', { ascending: true });
  }

  public async markAsRead(messageIds: string[]): Promise<void> {
    await this.supabase
      .from('customer_messages')
      .update({ is_read: true })
      .in('id', messageIds);
  }

  public async getUnreadSummaries(): Promise<{ data: any[] | null, error: any }> {
    return await this.supabase
      .from('unread_message_summaries')
      .select('*');
  }

  public async escalateMessage(messageId: string, reasoning: string): Promise<void> {
    await this.supabase
      .from('customer_messages')
      .update({ 
        escalation_state: 'ESCALATED',
        message_priority: 'CRITICAL'
      })
      .eq('id', messageId);

    // Alert the system
    eventBus.emit({
      type: 'CommunicationEscalated',
      actor: { id: 'SYSTEM', type: 'SYSTEM' },
      payload: { messageId, reasoning }
    });
  }
}
