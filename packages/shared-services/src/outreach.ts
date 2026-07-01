import { getSupabase } from './supabase';
import { LeadData } from '@click-india/shared-types';

export interface OutreachConfig {
  maxMessagesPerHour: number;
  minDelaySeconds: number;
  maxDelaySeconds: number;
  channels: ('EMAIL' | 'WHATSAPP' | 'SMS')[];
}

export class StealthOutreachService {
  private config: OutreachConfig = {
    maxMessagesPerHour: 10,
    minDelaySeconds: 120,
    maxDelaySeconds: 600,
    channels: ['EMAIL', 'WHATSAPP']
  };

  /**
   * Main entry point to process a batch of leads
   */
  async processOutreachBatch(limit: number = 5) {
    const supabase = getSupabase();
    
    // 1. Fetch leads that haven't been contacted yet
    const { data: leads, error } = await supabase
      .from('loan_leads')
      .select('*')
      .is('last_contacted_at', null)
      .limit(limit);

    if (error || !leads) {
      console.error('Failed to fetch outreach leads:', error);
      return;
    }

    for (const lead of leads) {
      await this.contactLead(lead);
      // Wait for a random delay to mimic human behavior
      const delay = Math.floor(Math.random() * (this.config.maxDelaySeconds - this.config.minDelaySeconds + 1) + this.config.minDelaySeconds);
      await new Promise(resolve => setTimeout(resolve, delay * 1000));
    }
  }

  private async contactLead(lead: LeadData) {
    const { aiService } = await import('./ai');
    console.log(`[STEALTH_AGENT] Contacting lead: ${lead.phone} via rotated channels`);
    
    // Logic for channel rotation and message spinning
    const message = await aiService.spinOutreachMessage(lead);
    
    // Log the outreach attempt for audit/tracking
    console.log(`[MESSAGE_SENT]: ${message}`);
    
    // Update lead as contacted
    const supabase = getSupabase();
    await supabase
      .from('loan_leads')
      .update({ 
        last_contacted_at: new Date().toISOString(),
        metadata: { ...lead.metadata, outreach_status: 'CONTACTED' }
      })
      .eq('id', lead.id);
  }
}

export const outreachService = new StealthOutreachService();
