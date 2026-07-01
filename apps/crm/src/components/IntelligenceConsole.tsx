import React, { useEffect, useState } from 'react';
import { 
  Users, 
  Activity,
  Calendar,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  Flame,
  Loader2
} from 'lucide-react';
import { supabase } from '../services/supabaseClient';

export default function IntelligenceConsole() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    todaysLeads: 0,
    eligibilityChecks: 0,
    hotLeads: 0,
    followUps: 0,
    revenueThisMonth: 0,
    conversionRate: 0,
    leadSources: [] as any[],
    loanTypes: [] as any[],
    topLenders: [] as any[],
    revenueByLender: [] as any[]
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

      // Fetch Customers
      const { data: customers } = await supabase.from('customers').select('*');
      
      let todaysLeads = 0;
      let hotLeads = 0;
      let eligibilityChecks = 0;
      let converted = 0;

      const sourceCount: Record<string, number> = {};
      const typeCount: Record<string, number> = {};

      if (customers) {
        customers.forEach(c => {
          const created = new Date(c.created_at);
          if (created >= today) todaysLeads++;
          if (c.lead_temperature === '🔥 Hot') hotLeads++;
          if (c.lead_status === 'Eligibility Checked' || c.lead_status === 'Forwarded' || c.lead_status === 'Converted') eligibilityChecks++;
          if (c.lead_status === 'Converted') converted++;

          const src = c.lead_source || 'Organic';
          sourceCount[src] = (sourceCount[src] || 0) + 1;

          const lType = c.loan_type || 'Personal Loan';
          typeCount[lType] = (typeCount[lType] || 0) + 1;
        });
      }

      // Fetch FollowUps
      const { data: followups } = await supabase.from('followups').select('*').eq('status', 'Pending');
      let pendingFollowUps = followups ? followups.length : 0;

      // Fetch Revenues
      const { data: revenues } = await supabase.from('revenues').select('*, lenders(lender_name)').gte('earned_at', firstDayOfMonth.toISOString());
      let revThisMonth = 0;
      const lenderRevCount: Record<string, number> = {};
      const lenderMatchCount: Record<string, number> = {};

      if (revenues) {
        revenues.forEach(r => {
          if (r.revenue_status === 'Received') {
            revThisMonth += Number(r.revenue_earned);
            const lName = r.lenders?.lender_name || 'Unknown';
            lenderRevCount[lName] = (lenderRevCount[lName] || 0) + Number(r.revenue_earned);
          }
        });
      }

      // Fetch Matches for top lenders
      const { data: matches } = await supabase.from('matches').select('*, lenders(lender_name)');
      if (matches) {
        matches.forEach(m => {
          const lName = m.lenders?.lender_name || 'Unknown';
          lenderMatchCount[lName] = (lenderMatchCount[lName] || 0) + 1;
        });
      }

      const conversionRate = customers && customers.length > 0 ? (converted / customers.length) * 100 : 0;

      setMetrics({
        todaysLeads,
        eligibilityChecks,
        hotLeads,
        followUps: pendingFollowUps,
        revenueThisMonth: revThisMonth,
        conversionRate,
        leadSources: Object.entries(sourceCount).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value),
        loanTypes: Object.entries(typeCount).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value),
        topLenders: Object.entries(lenderMatchCount).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value).slice(0, 5),
        revenueByLender: Object.entries(lenderRevCount).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value).slice(0, 5)
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
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
            <Users size={28} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Today's Leads</p>
            <h3 className="text-3xl font-black text-slate-900">{metrics.todaysLeads}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ShieldCheck size={28} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Eligibility Checks</p>
            <h3 className="text-3xl font-black text-slate-900">{metrics.eligibilityChecks}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center">
            <Flame size={28} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Hot Leads</p>
            <h3 className="text-3xl font-black text-slate-900">{metrics.hotLeads}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
            <Calendar size={28} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Pending Follow Ups</p>
            <h3 className="text-3xl font-black text-slate-900">{metrics.followUps}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 rounded-full bg-green-50 text-green-600 flex items-center justify-center">
            <DollarSign size={28} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Revenue This Month</p>
            <h3 className="text-3xl font-black text-slate-900">₹{metrics.revenueThisMonth.toLocaleString()}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <TrendingUp size={28} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Conversion Rate</p>
            <h3 className="text-3xl font-black text-slate-900">{metrics.conversionRate.toFixed(1)}%</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8">
        {/* Simple Charts / Lists */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <h2 className="text-lg font-bold text-slate-900">Lead Sources</h2>
          </div>
          <div className="p-8 space-y-4">
            {metrics.leadSources.map(src => (
              <div key={src.name} className="flex justify-between items-center">
                <span className="text-slate-700 font-medium">{src.name}</span>
                <span className="font-bold text-slate-900">{src.value}</span>
              </div>
            ))}
            {metrics.leadSources.length === 0 && <div className="text-slate-500">No data</div>}
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <h2 className="text-lg font-bold text-slate-900">Loan Type Distribution</h2>
          </div>
          <div className="p-8 space-y-4">
            {metrics.loanTypes.map(type => (
              <div key={type.name} className="flex justify-between items-center">
                <span className="text-slate-700 font-medium">{type.name}</span>
                <span className="font-bold text-slate-900">{type.value}</span>
              </div>
            ))}
            {metrics.loanTypes.length === 0 && <div className="text-slate-500">No data</div>}
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <h2 className="text-lg font-bold text-slate-900">Top Matched Lenders</h2>
          </div>
          <div className="p-8 space-y-4">
            {metrics.topLenders.map(lender => (
              <div key={lender.name} className="flex justify-between items-center">
                <span className="text-slate-700 font-medium">{lender.name}</span>
                <span className="font-bold text-blue-600">{lender.value} Matches</span>
              </div>
            ))}
            {metrics.topLenders.length === 0 && <div className="text-slate-500">No data</div>}
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <h2 className="text-lg font-bold text-slate-900">Revenue by Lender</h2>
          </div>
          <div className="p-8 space-y-4">
            {metrics.revenueByLender.map(lender => (
              <div key={lender.name} className="flex justify-between items-center">
                <span className="text-slate-700 font-medium">{lender.name}</span>
                <span className="font-bold text-green-600">₹{lender.value.toLocaleString()}</span>
              </div>
            ))}
            {metrics.revenueByLender.length === 0 && <div className="text-slate-500">No data</div>}
          </div>
        </div>

      </div>
    </div>
  );
}
