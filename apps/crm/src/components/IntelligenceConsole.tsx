import React, { useEffect, useState } from 'react';
import { 
  TrendingUp, 
  AlertTriangle, 
  Clock, 
  Users, 
  Activity,
  ArrowUpRight,
  ShieldAlert,
  Loader2,
  PhoneCall,
  FileText,
  CheckCircle2,
  DollarSign
} from 'lucide-react';
import { supabase } from '../services/supabaseClient';

export default function IntelligenceConsole() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    leads: { NEW: 0, CONTACTED: 0, ELIGIBILITY_ASSESSED: 0, DOCUMENTS_PENDING: 0, SUBMITTED: 0, APPROVED: 0, REJECTED: 0, DISBURSED: 0 },
    revenue: { consultation: 0, commission: 0, total: 0 },
    tasks: { followUps: 0, pendingDocs: 0, upcomingConsultations: 0 }
  });

  useEffect(() => {
    fetchDashboardData();
    
    const channel = supabase.channel('os-dashboard')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, fetchDashboardData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'consultations' }, fetchDashboardData)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch Leads
      const { data: leads } = await supabase.from('leads').select('status, urgent_action_required');
      const leadCounts = { NEW: 0, CONTACTED: 0, ELIGIBILITY_ASSESSED: 0, DOCUMENTS_PENDING: 0, SUBMITTED: 0, APPROVED: 0, REJECTED: 0, DISBURSED: 0 };
      let followUps = 0;
      
      if (leads) {
        leads.forEach(l => {
          if (leadCounts[l.status as keyof typeof leadCounts] !== undefined) {
            leadCounts[l.status as keyof typeof leadCounts]++;
          }
          if (l.urgent_action_required) followUps++;
        });
      }

      // Fetch Consultations
      const { data: consultations } = await supabase.from('consultations').select('amount_paid, status');
      let consultationRevenue = 0;
      let upcoming = 0;
      if (consultations) {
        consultations.forEach(c => {
          if (c.status === 'COMPLETED') consultationRevenue += Number(c.amount_paid || 0);
          if (c.status === 'PENDING') upcoming++;
        });
      }

      // Fetch Referrals for Commission (Mocking commission logic for now)
      const { data: referrals } = await supabase.from('referrals').select('revenue_generated');
      let commissionRevenue = 0;
      if (referrals) {
        referrals.forEach(r => {
          commissionRevenue += Number(r.revenue_generated || 0);
        });
      }

      setMetrics({
        leads: leadCounts,
        revenue: {
          consultation: consultationRevenue,
          commission: commissionRevenue,
          total: consultationRevenue + commissionRevenue
        },
        tasks: {
          followUps,
          pendingDocs: leadCounts.DOCUMENTS_PENDING,
          upcomingConsultations: upcoming
        }
      });
    } catch (error) {
      console.error('Error fetching OS dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-500">
        <Loader2 className="animate-spin text-blue-500" size={40} />
        <p className="text-sm font-bold uppercase tracking-widest">Loading OS Intelligence...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-10">
      
      {/* Top Level Metrics */}
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
            <DollarSign size={28} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Total Revenue</p>
            <h3 className="text-3xl font-black text-slate-900">₹{metrics.revenue.total.toLocaleString()}</h3>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Consulting: ₹{metrics.revenue.consultation.toLocaleString()} | Commission: ₹{metrics.revenue.commission.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center">
            <PhoneCall size={28} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Active Tasks</p>
            <h3 className="text-3xl font-black text-slate-900">{metrics.tasks.followUps + metrics.tasks.upcomingConsultations}</h3>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              {metrics.tasks.followUps} Follow Ups | {metrics.tasks.upcomingConsultations} Consultations
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Users size={28} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Pipeline Volume</p>
            <h3 className="text-3xl font-black text-slate-900">
              {Object.values(metrics.leads).reduce((a, b) => a + b, 0)}
            </h3>
            <p className="text-xs text-emerald-600 mt-1 font-bold">
              {metrics.leads.APPROVED} Approved | {metrics.leads.DISBURSED} Disbursed
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-8">
        
        {/* Leads Funnel */}
        <div className="col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Advisory Pipeline</h2>
              <p className="text-xs text-slate-500 mt-1">Real-time status of all prospects and active cases.</p>
            </div>
            <Activity className="text-blue-500" size={24} />
          </div>
          
          <div className="p-8 space-y-6">
            {[
              { label: 'New Leads', key: 'NEW', color: 'blue' },
              { label: 'Contacted', key: 'CONTACTED', color: 'purple' },
              { label: 'Eligibility Assessed', key: 'ELIGIBILITY_ASSESSED', color: 'indigo' },
              { label: 'Documents Pending', key: 'DOCUMENTS_PENDING', color: 'orange' },
              { label: 'Submitted to Lender', key: 'SUBMITTED', color: 'amber' },
            ].map(stage => (
              <div key={stage.key} className="space-y-2">
                <div className="flex justify-between items-center text-sm font-bold text-slate-700">
                  <span>{stage.label}</span>
                  <span>{metrics.leads[stage.key as keyof typeof metrics.leads]}</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-${stage.color}-500 rounded-full transition-all duration-1000`} 
                    style={{ width: `${Math.min((metrics.leads[stage.key as keyof typeof metrics.leads] / 50) * 100, 100)}%` }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Center */}
        <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-lg text-white overflow-hidden flex flex-col">
          <div className="px-8 py-6 border-b border-slate-800">
            <h2 className="text-lg font-bold">Action Center</h2>
            <p className="text-xs text-slate-400 mt-1">Requires immediate attention</p>
          </div>
          
          <div className="p-8 flex-1 space-y-4 flex flex-col justify-center">
            
            <div className="bg-slate-800/50 border border-slate-700 p-5 rounded-2xl flex items-center justify-between group hover:border-orange-500 transition-colors cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center">
                  <Clock size={20} />
                </div>
                <div>
                  <h4 className="font-bold">Upcoming Consultations</h4>
                  <p className="text-xs text-slate-400">{metrics.tasks.upcomingConsultations} scheduled</p>
                </div>
              </div>
              <ArrowUpRight className="text-slate-500 group-hover:text-orange-400 transition-colors" />
            </div>

            <div className="bg-slate-800/50 border border-slate-700 p-5 rounded-2xl flex items-center justify-between group hover:border-red-500 transition-colors cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h4 className="font-bold">Urgent Follow-Ups</h4>
                  <p className="text-xs text-slate-400">{metrics.tasks.followUps} leads need contact</p>
                </div>
              </div>
              <ArrowUpRight className="text-slate-500 group-hover:text-red-400 transition-colors" />
            </div>

            <div className="bg-slate-800/50 border border-slate-700 p-5 rounded-2xl flex items-center justify-between group hover:border-blue-500 transition-colors cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center">
                  <FileText size={20} />
                </div>
                <div>
                  <h4 className="font-bold">Pending Documents</h4>
                  <p className="text-xs text-slate-400">{metrics.tasks.pendingDocs} files awaiting upload</p>
                </div>
              </div>
              <ArrowUpRight className="text-slate-500 group-hover:text-blue-400 transition-colors" />
            </div>

          </div>
        </div>
        
      </div>
    </div>
  );
}
