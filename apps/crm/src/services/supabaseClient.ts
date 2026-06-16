import { createClient } from '@supabase/supabase-js';
import { setSupabase } from '@click-india/shared-services';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log("DEBUG Supabase URL:", supabaseUrl);

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables are missing in CRM.');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');
setSupabase(supabase);

// Initialize Agentic Layer (Currently unimplemented in shared-agents)
/*
import { 
  agentOrchestrator, 
  ConsultationSummaryAgent, 
  FollowUpAgent, 
  DocWorkflowAgent, 
  PrioritizationAgent 
} from '@click-india/shared-agents';

agentOrchestrator.registerAgent(new ConsultationSummaryAgent());
agentOrchestrator.registerAgent(new FollowUpAgent());
agentOrchestrator.registerAgent(new DocWorkflowAgent());
agentOrchestrator.registerAgent(new PrioritizationAgent());
agentOrchestrator.start();
*/
export { 
  leadService, 
  aiService, 
  blueprintService, 
  intelligenceService,
  paymentService,
  AgentActionCenter,
  UptimeService,
  getSupabase,
  communicationService,
  analyticsService,
  settlementService,
  outreachService,
  customerService
} from '@click-india/shared-services';
export default supabase;
