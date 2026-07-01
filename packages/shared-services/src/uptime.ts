import { getSupabase } from './supabase';

export class UptimeService {
  public static async checkHealth(): Promise<{ status: 'HEALTHY' | 'UNHEALTHY', latency: number, error?: any }> {
    const start = Date.now();
    try {
      const supabase = getSupabase();
      const { error } = await supabase.from('users').select('id').limit(1);
      
      const latency = Date.now() - start;
      
      if (error) throw error;

      return {
        status: 'HEALTHY',
        latency,
      };
    } catch (err) {
      return {
        status: 'UNHEALTHY',
        latency: Date.now() - start,
        error: err
      };
    }
  }

  public static async logHealthEvent(service: string, health: { status: string, latency: number, error?: any }) {
    try {
      const supabase = getSupabase();
      await supabase.from('system_health_logs').insert([{
        service_name: service,
        status: health.status,
        latency_ms: health.latency,
        error_payload: health.error ? { message: health.error.message || health.error } : null
      }]);
    } catch (err) {
      console.error('[UPTIME_LOG_ERROR]', err);
    }
  }

  public static startHeartbeat(intervalMs: number = 60000, serviceName: string = 'CRM_DASHBOARD') {
    console.log(`[UPTIME] Heartbeat started for ${serviceName} every ${intervalMs}ms`);
    setInterval(async () => {
      const health = await this.checkHealth();
      
      // Persist to DB for production monitoring
      await this.logHealthEvent(serviceName, health);

      if (health.status === 'UNHEALTHY') {
        console.error(`[UPTIME_ALERT] ${serviceName} health degraded:`, health.error);
      } else {
        console.log(`[UPTIME_HEARTBEAT] ${serviceName} Latency: ${health.latency}ms`);
      }
    }, intervalMs);
  }
}
