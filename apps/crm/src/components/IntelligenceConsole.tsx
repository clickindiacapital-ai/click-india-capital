import React, { useEffect, useState } from 'react';
import { 
  TrendingUp, 
  AlertTriangle, 
  Clock, 
  Users, 
  Activity,
  ArrowUpRight,
  ShieldAlert,
  Loader2
} from 'lucide-react';
import { supabase } from '../services/supabaseClient';

interface ActionItem {
  id: string;
  name: string;
  urgency: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  action: string;
  time: string;
}

const IntelligenceConsole: React.FC = () => {
  const [priorities, setPriorities] = useState<ActionItem[]>([]);
  const [funnelData, setFunnelData] = useState({ standardLoans: 0, diagnosis: 0, consultation: 0, settlement: 0 });
  const [exceptions, setExceptions] = useState({ missedConsultations: 0, pendingVerification: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIntelligenceData = async () => {
      setLoading(true);
      try {
        // 1. Fetch Funnel Health (from loan_leads)
        const { data: leads, error: leadsError } = await supabase.from('loan_leads').select('*');
        if (!leadsError && leads) {
          const standardLoans = leads.filter(l => !l.consultation_tier && (l.loan_type !== 'DEBT_REHAB')).length;
          const diagnosis = leads.filter(l => l.consultation_tier === 'DIAGNOSIS_49' || (l.loan_type === 'DEBT_REHAB' && !l.consultation_tier)).length;
          const consultation = leads.filter(l => l.consultation_tier === 'CONSULTATION_199').length;
          const settlement = leads.filter(l => l.consultation_tier === 'RESOLUTION_4999' || l.consultation_tier === 'BLUEPRINT_1500').length;
          setFunnelData({ standardLoans, diagnosis, consultation, settlement });
        }

        // 2. Fetch Exceptions
        const { count: pendingPayments, error: paymentError } = await supabase
          .from('payment_submissions')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'PENDING_VERIFICATION');

        setExceptions({
          missedConsultations: 0, // Mocked for now until consultation_stages logic is fully implemented
          pendingVerification: pendingPayments || 0
        });

        // 3. Fetch Priorities (Payment verification, Leads needing follow-up)
        const newPriorities: ActionItem[] = [];
        
        // Add pending payments to priorities
        const { data: payments } = await supabase
          .from('payment_submissions')
          .select('id, phone, created_at, amount')
          .eq('status', 'PENDING_VERIFICATION')
          .order('created_at', { ascending: false })
          .limit(3);

        if (payments) {
          payments.forEach(p => {
            newPriorities.push({
              id: p.id,
              name: p.phone || 'Unknown User',
              urgency: 'CRITICAL',
              action: `Verify ₹${p.amount} Payment`,
              time: formatTimeAgo(p.created_at)
            });
          });
        }

        // Add urgent leads if we have room
        if (newPriorities.length < 3 && leads) {
          const urgentLeads = leads
            .filter(l => l.urgent_action_required)
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 3 - newPriorities.length);

          urgentLeads.forEach(l => {
            newPriorities.push({
              id: l.id,
              name: l.phone || l.id.substring(0, 8),
              urgency: 'HIGH',
              action: 'Lead Follow-up Required',
              time: formatTimeAgo(l.created_at)
            });
          });
        }

        setPriorities(newPriorities);
      } catch (err) {
        console.error('Error fetching intelligence data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchIntelligenceData();

    // Setup Realtime Subscription
    const channel = supabase.channel('intelligence-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'loan_leads' }, fetchIntelligenceData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payment_submissions' }, fetchIntelligenceData)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const formatTimeAgo = (dateString: string) => {
    const minutes = Math.floor((new Date().getTime() - new Date(dateString).getTime()) / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4 text-gray-500">
        <Loader2 className="animate-spin" size={40} />
        <p className="text-[10px] font-black uppercase tracking-widest">Compiling Intelligence...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-1000">
      <div className="grid grid-cols-3 gap-8">
        {/* Priority Queue - Focused on Action */}
        <div className="col-span-2 space-y-6">
          <div className="flex justify-between items-end">
             <div>
                <h3 className="text-2xl font-black tracking-tighter uppercase">Immediate Priorities</h3>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest italic">Pilot Action Items</p>
             </div>
             <button className="text-[10px] font-black text-blue-500 uppercase tracking-widest hover:text-blue-400">
                View Full Queue
             </button>
          </div>

          <div className="space-y-3">
            {priorities.length === 0 ? (
               <div className="p-6 bg-[#0A111F] border border-white/5 rounded-3xl text-center">
                 <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">No immediate priorities</p>
               </div>
            ) : (
              priorities.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-6 bg-[#0A111F] border border-white/5 rounded-3xl group hover:border-blue-500/20 transition-all">
                  <div className="flex items-center gap-5">
                    <div className={`w-3 h-3 rounded-full ${item.urgency === 'CRITICAL' ? 'bg-red-500 animate-pulse' : item.urgency === 'HIGH' ? 'bg-orange-500' : 'bg-blue-500'}`} />
                    <div>
                        <h4 className="font-bold text-lg">{item.name}</h4>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{item.action}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <span className="text-[10px] font-black text-gray-700 uppercase tracking-widest">{item.time}</span>
                    <button className="px-6 py-3 bg-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                        Resolve
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Workflow Health & Exceptions */}
        <div className="space-y-8">
           <div className="space-y-6">
              <h3 className="text-2xl font-black tracking-tighter uppercase text-red-500 flex items-center gap-2">
                <ShieldAlert size={24} /> Exceptions
              </h3>
              <div className="bg-red-500/5 rounded-3xl border border-red-500/10 p-8 space-y-6">
                 <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Missed Consultations</span>
                    <span className="text-red-500 font-black">{exceptions.missedConsultations < 10 ? `0${exceptions.missedConsultations}` : exceptions.missedConsultations}</span>
                 </div>
                 <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Pending Verification</span>
                    <span className="text-orange-500 font-black">{exceptions.pendingVerification < 10 ? `0${exceptions.pendingVerification}` : exceptions.pendingVerification}</span>
                 </div>
                 <button className="w-full py-4 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
                   Audit Exceptions
                 </button>
              </div>
           </div>

           <div className="space-y-6 pt-4">
              <h3 className="text-2xl font-black tracking-tighter uppercase">Funnel Health</h3>
              <div className="bg-[#0A111F] rounded-3xl border border-white/5 p-8 space-y-8">
                 {[
                   { stage: 'Loans', count: funnelData.standardLoans, color: 'blue' },
                   { stage: 'Diagnosis', count: funnelData.diagnosis, color: 'emerald' },
                   { stage: 'Consultation', count: funnelData.consultation, color: 'purple' },
                   { stage: 'Settlement', count: funnelData.settlement, color: 'orange' },
                 ].map((item, i) => (
                   <div key={i} className="space-y-3">
                      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-500">
                         <span>{item.stage}</span>
                         <span className="text-white">{item.count}</span>
                      </div>
                      <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                         <div className={`h-full bg-${item.color}-500 rounded-full transition-all duration-1000`} style={{ width: `${Math.min((item.count/50)*100, 100)}%` }} />
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>

      {/* Agent Operations & Intelligence Sources */}
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-[#0A111F] p-10 rounded-[40px] border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
            <Activity size={120} />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-10">
            <div className="space-y-4 max-w-2xl">
              <div className="flex items-center gap-3">
                <div className="px-3 py-1 bg-blue-500/10 rounded-full border border-blue-500/20 text-blue-500 text-[10px] font-black uppercase tracking-widest">
                  Active System Agent
                </div>
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <h3 className="text-3xl font-black tracking-tighter uppercase">Insight Curator Agent</h3>
              <p className="text-gray-500 text-sm leading-relaxed font-medium">
                Our AI Content Strategist monitors <strong>institutional Tier-1 publications</strong> including The Economic Times, Business Standard, Mint, and Moneycontrol. It synthesizes market-leading intelligence for institutional-grade authority.
              </p>
              <div className="flex gap-8 pt-2">
                <div>
                  <p className="text-[10px] font-black text-gray-700 uppercase tracking-widest mb-1">Last Research</p>
                  <p className="text-sm font-bold">14 May 2026, 14:45</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-700 uppercase tracking-widest mb-1">Sources Scanned</p>
                  <p className="text-sm font-bold">Institutional Tier-1</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-700 uppercase tracking-widest mb-1">Accuracy Score</p>
                  <p className="text-sm font-bold text-emerald-500">98.4% Verified</p>
                </div>
              </div>
            </div>
            <button className="whitespace-nowrap px-10 py-5 bg-white text-[#0A111F] font-black uppercase tracking-widest rounded-2xl hover:bg-blue-500 hover:text-white transition-all shadow-xl shadow-white/5">
              Trigger Global Research
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntelligenceConsole;
