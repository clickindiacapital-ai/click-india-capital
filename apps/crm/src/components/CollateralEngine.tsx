import React, { useEffect, useState } from 'react';
import { leadService, aiService } from '../services/supabaseClient';
import { Wallet, Car, Home, TrendingUp, Info, ArrowRight } from 'lucide-react';
import { LeadData } from '@click-india/shared-types';

const CollateralEngine = () => {
  const [leads, setLeads] = useState<LeadData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const { data, error } = await leadService.getAllLeads();
      if (error) throw error;
      // Filter for leads with assets
      const filtered = (data || []).filter(l => 
        l.loan_type === 'VEHICLE' || 
        l.loan_type === 'PROPERTY' ||
        (l.metadata as any)?.has_assets === true
      );
      setLeads(filtered);
    } catch (err) {
      console.error('Failed to fetch asset leads:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-black uppercase tracking-tighter">Collateral Valuation Engine</h3>
          <p className="text-gray-500 font-medium">Market-linked estimates for {leads.length} secured positions</p>
        </div>
      </div>

      {isLoading ? (
        <div className="h-64 flex items-center justify-center bg-[#0A111F] rounded-[40px] border border-white/5 animate-pulse">
           <p className="text-xs font-black uppercase tracking-widest text-gray-500">Valuating Assets...</p>
        </div>
      ) : leads.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center bg-[#0A111F] rounded-[40px] border border-white/5 text-center">
           <Wallet size={48} className="text-blue-500 mb-4 opacity-20" />
           <p className="text-xs font-black uppercase tracking-widest text-gray-500">No active collateral cases detected</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {leads.map((lead) => {
            const assetType = lead.loan_type === 'VEHICLE' || lead.loan_type === 'PROPERTY' ? lead.loan_type : 'VEHICLE';
            const value = aiService.estimateAssetValue(assetType, lead.metadata || {});
            
            return (
              <div key={lead.id} className="bg-[#0A111F] p-8 rounded-[40px] border border-white/5 hover:border-blue-500/30 transition-all group">
                <div className="flex justify-between items-start mb-8">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                    assetType === 'VEHICLE' ? 'bg-blue-500/10 text-blue-500' : 'bg-emerald-500/10 text-emerald-500'
                  }`}>
                    {assetType === 'VEHICLE' ? <Car size={24} /> : <Home size={24} />}
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Est. Market Value</p>
                    <p className="text-xl font-black text-white">₹{value.toLocaleString()}</p>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                    <span className="text-gray-500">Asset Type</span>
                    <span className="text-white">{assetType}</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                    <span className="text-gray-500">Owner</span>
                    <span className="text-white truncate max-w-[120px]">{lead.full_name || lead.phone}</span>
                  </div>
                </div>

                <div className="p-4 bg-white/2 rounded-2xl border border-white/5 mb-8">
                   <div className="flex items-center gap-3 text-xs font-bold text-gray-400 uppercase tracking-widest leading-relaxed">
                      <TrendingUp size={14} className="text-blue-500" />
                      LTV Potential: {assetType === 'VEHICLE' ? '70%' : '60%'}
                   </div>
                </div>

                <button className="w-full py-4 bg-white/5 hover:bg-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2">
                   View Full Audit <ArrowRight size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CollateralEngine;
