import { supabase } from './supabase';
import { EscalationService } from './escalation';

export class EngagementService {
  public static async trackActivity(customerId: string): Promise<void> {
    await supabase
      .from('user_profiles')
      .update({ last_active_at: new Date().toISOString() })
      .eq('id', customerId);
  }

  public static async monitorEngagement(): Promise<void> {
    const { data: users, error } = await supabase
      .from('user_profiles')
      .select('id, last_active_at')
      .lt('last_active_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    if (error || !users) return;

    for (const user of users) {
      const daysInactive = Math.floor((Date.now() - new Date(user.last_active_at).getTime()) / (1000 * 60 * 60 * 24));
      await EscalationService.checkInactivity(user.id, daysInactive);
    }
  }

  public static async checkMissedConsultations(): Promise<void> {
    const { data: leads, error } = await supabase
      .from('loan_leads')
      .select('id, status, metadata')
      .eq('status', 'CONSULTATION_SCHEDULED')
      .lt('metadata->>consultation_date', new Date().toISOString());

    if (error || !leads) return;

    for (const lead of leads) {
      await EscalationService.triggerEscalation(lead.id, 'LEAD', 'Missed consultation intervention required', 'HIGH');
    }
  }
}
