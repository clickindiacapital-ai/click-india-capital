import React, { useEffect, useState } from 'react';
import { leadService, settlementService } from '../services/supabaseClient';
import { ShieldAlert, TrendingDown, Clock, CheckCircle2, AlertTriangle, ArrowUpRight } from 'lucide-react';
import { LeadData } from '@click-india/shared-types';

const SettlementDesk = () => {
  const [leads, setLeads] = useState<LeadData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const { data, error } = await leadService.getAllLeads();
      if (error) throw error;
      // Filter for leads that might need settlement (Unsecured or high DPD)
      const filtered = (data || []).filter(l => 
        l.loan_type === 'PERSONAL' || 
        l.loan_type === 'CREDIT_CARD' || 
        ((l.metadata as any)?.dpd || 0) > 60
      );
      setLeads(filtered);
    } catch (err) {
      console.error('Failed to fetch settlement leads:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-black uppercase tracking-tighter">Settlement Strategy Desk</h3>
          <p className="text-gray-500 font-medium">AI-powered feasibility analysis for {leads.length} active cases</p>
        </div>
      </div>

      {isLoading ? (
        <div className="h-64 flex items-center justify-center bg-[#0A111F] rounded-[40px] border border-white/5 animate-pulse">
           <p className="text-xs font-black uppercase tracking-widest text-gray-500">Running Probability Engines...</p>
        </div>
      ) : leads.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center bg-[#0A111F] rounded-[40px] border border-white/5 text-center">
           <CheckCircle2 size={48} className="text-emerald-500 mb-4 opacity-20" />
           <p className="text-xs font-black uppercase tracking-widest text-gray-500">No critical settlement cases detected</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {leads.map((lead) => {
            const strategy = settlementService.calculateSettlementStrategy(lead);
            const probPercent = Math.round(strategy.probability * 100);
            
            return (
              <div key={lead.id} className="bg-[#0A111F] p-8 rounded-[40px] border border-white/5 hover:border-orange-500/30 transition-all group relative overflow-hidden">
                <div className={`absolute top-0 right-0 px-6 py-2 rounded-bl-3xl text-[10px] font-black uppercase tracking-widest ${
                  strategy.rejectionRisk === 'LOW' ? 'bg-emerald-500' : strategy.rejectionRisk === 'MEDIUM' ? 'bg-orange-500' : 'bg-red-500'
                }`}>
                  Risk: {strategy.rejectionRisk}
                </div>

                <div className="flex items-start gap-6 mb-8">
                  <div className="w-16 h-16 bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-500">
                     <ShieldAlert size={28} />
                  </div>
                  <div>
                    <h4 className="text-lg font-black uppercase tracking-tight">{lead.phone}</h4>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{lead.loan_type} DEBT</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="bg-white/2 p-4 rounded-2xl border border-white/5">
                    <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest mb-1">Total Debt</p>
                    <p className="text-sm font-black uppercase">₹{lead.loan_amount?.toLocaleString()}</p>
                  </div>
                  <div className="bg-white/2 p-4 rounded-2xl border border-white/5">
                    <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest mb-1">Target Pay</p>
                    <p className="text-sm font-black uppercase text-emerald-400">₹{strategy.estimatedSettlementAmount.toLocaleString()}</p>
                  </div>
                  <div className="bg-white/2 p-4 rounded-2xl border border-white/5">
                    <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest mb-1">Savings</p>
                    <p className="text-sm font-black uppercase text-orange-400">₹{strategy.savings.toLocaleString()}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-end mb-1">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Settlement Probability</p>
                    <p className={`text-xl font-black ${probPercent > 70 ? 'text-emerald-400' : probPercent > 40 ? 'text-orange-400' : 'text-red-400'}`}>{probPercent}%</p>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ${
                        probPercent > 70 ? 'bg-emerald-500' : probPercent > 40 ? 'bg-orange-500' : 'bg-red-500'
                      }`} 
                      style={{ width: `${probPercent}%` }} 
                    />
                  </div>
                </div>

                <div className="mt-8 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                       <Clock size={14} /> {strategy.timeframeMonths} Months
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                       <TrendingDown size={14} /> {strategy.strategyType}
                    </div>
                  </div>
                  <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/20">
                     Generate Proposal <ArrowUpRight size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SettlementDesk;
