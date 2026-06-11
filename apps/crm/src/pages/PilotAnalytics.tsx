import React, { useState, useEffect } from 'react';
import { 
  Users, 
  MessageSquare, 
  TrendingUp, 
  Smile, 
  Frown, 
  Meh, 
  Zap, 
  BrainCircuit,
  Target,
  BarChart3,
  Loader2
} from 'lucide-react';
import { analyticsService } from '../services/supabaseClient';

const PilotAnalytics = () => {
  const [funnel, setFunnel] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFunnel = async () => {
      try {
        const data = await analyticsService.getTransformationFunnel();
        setFunnel(data);
      } catch (err) {
        console.error('Failed to fetch funnel:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFunnel();
    const interval = setInterval(fetchFunnel, 30000); // 30s
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-gray-500">
        <Loader2 className="animate-spin" size={40} />
        <p className="text-[10px] font-black uppercase tracking-widest">Compiling Pilot Data...</p>
      </div>
    );
  }

  // Guard against null funnel data (empty DB on first load)
  if (!funnel) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-gray-500">
        <BarChart3 size={48} className="text-gray-800" />
        <p className="text-[10px] font-black uppercase tracking-widest">No pilot data yet — awaiting first leads</p>
      </div>
    );
  }

  const kpis = [
    { label: 'Onboarding Flow', value: funnel.diagnosis ?? 0, sub: 'Total Initiated', color: 'blue' },
    { label: 'Diagnosis Rate', value: funnel.completed_diagnosis ?? 0, sub: 'Completed Analysis', color: 'emerald' },
    { label: 'Retention Intent', value: funnel.paid_diagnosis ?? 0, sub: 'Pilot Payments', color: 'purple' },
    { label: 'Strategy Output', value: funnel.strategy_blueprints ?? 0, sub: 'Generated Roadmap', color: 'orange' },
  ];

  return (
    <div className="p-10 space-y-10 animate-in fade-in duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black tracking-tighter uppercase mb-2">Pilot Transformation Analytics</h2>
          <p className="text-gray-500 font-medium italic">Real-world Conversion Funnel • Phase 8 Production Readiness</p>
        </div>
        <div className="bg-emerald-600/10 border border-emerald-600/20 px-6 py-3 rounded-2xl flex items-center gap-3">
           <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
           <span className="text-xs font-black text-emerald-500 uppercase tracking-widest">PILOT_MODE: LIVE TELEMETRY</span>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-4 gap-6">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-[#0A111F] p-8 rounded-[40px] border border-white/5 relative overflow-hidden group hover:border-blue-500/20 transition-all">
            <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1">{kpi.label}</p>
            <h4 className="text-4xl font-black mb-1">{kpi.value}</h4>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{kpi.sub}</p>
            <div className={`absolute -right-4 -bottom-4 w-24 h-24 bg-${kpi.color}-500/5 rounded-full blur-2xl group-hover:bg-${kpi.color}-500/10 transition-all`} />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-8">
        {/* Transformation Funnel Visualization */}
        <div className="col-span-2 bg-[#0A111F] p-10 rounded-[40px] border border-white/5">
           <h3 className="text-2xl font-black mb-10 flex items-center gap-3 uppercase tracking-tighter">
              <TrendingUp className="text-blue-500" />
              Acquisition Transformation Funnel
           </h3>
           <div className="space-y-8">
              {[
                { label: 'Diagnosis Initiated', count: funnel.diagnosis, total: funnel.diagnosis, color: 'bg-blue-600' },
                { label: 'Analysis Completed', count: funnel.completed_diagnosis, total: funnel.diagnosis, color: 'bg-blue-500' },
                { label: 'Strategic Commitment', count: funnel.paid_diagnosis, total: funnel.diagnosis, color: 'bg-purple-500' },
                { label: 'Blueprint Delivery', count: funnel.strategy_blueprints, total: funnel.diagnosis, color: 'bg-emerald-500' },
              ].map((step, i) => (
                <div key={i}>
                   <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-3">
                      <span className="text-gray-500">{step.label}</span>
                      <span className="text-white">{step.count} ({step.diagnosis === 0 ? 0 : Math.round((step.count / step.total) * 100)}%)</span>
                   </div>
                   <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${step.color} rounded-full transition-all duration-1000`} 
                        style={{ width: `${step.total === 0 ? 0 : (step.count / step.total) * 100}%` }} 
                      />
                   </div>
                </div>
              ))}
           </div>
        </div>

        {/* Operational Bottlenecks */}
        <div className="bg-[#0A111F] p-10 rounded-[40px] border border-white/5 flex flex-col">
           <h3 className="text-2xl font-black mb-10 flex items-center gap-3 uppercase tracking-tighter">
              <Zap className="text-orange-500" />
              Pilot Friction
           </h3>
           <div className="flex-1 space-y-6">
              {[
                { label: 'Onboarding Load', impact: 'STABLE', status: 'Optimal' },
                { label: 'Payment Friction', impact: 'LOW', status: 'Validating' },
                { label: 'Doc Verification', impact: 'PENDING', status: 'Awaiting User' },
              ].map((point) => (
                <div key={point.label} className="p-5 bg-white/2 border border-white/5 rounded-2xl group hover:border-orange-500/20 transition-all">
                   <div className="flex justify-between items-center mb-2">
                      <p className="text-sm font-black">{point.label}</p>
                      <span className="text-[8px] font-black px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/10">
                         {point.impact}
                      </span>
                   </div>
                   <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">{point.status}</p>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default PilotAnalytics;
