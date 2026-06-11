import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Zap, 
  Activity, 
  ChevronRight,
  ShieldCheck,
  Search,
  BrainCircuit
} from 'lucide-react';
import { AgentActionCenter } from '../services/supabaseClient';
import { AgentRecommendation } from '@click-india/shared-types';

const AgentOps = () => {
  const [recommendations, setRecommendations] = useState<AgentRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      const data = await AgentActionCenter.getPendingRecommendations();
      setRecommendations(data);
    } catch (err) {
      console.error('Failed to fetch recommendations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    await AgentActionCenter.approveRecommendation(id, 'SYSTEM_ADMIN');
    fetchRecommendations();
  };

  const handleReject = async (id: string) => {
    await AgentActionCenter.rejectRecommendation(id, 'SYSTEM_ADMIN', 'Manual override');
    fetchRecommendations();
  };

  const agents = [
    { name: 'Consultation Agent', status: 'ACTIVE', efficiency: '94%', load: '12 events/hr', health: 'OPTIMAL' },
    { name: 'Follow-up Agent', status: 'ACTIVE', efficiency: '88%', load: '45 events/hr', health: 'OPTIMAL' },
    { name: 'Prioritization Agent', status: 'ACTIVE', efficiency: '91%', load: '82 events/hr', health: 'OPTIMAL' },
    { name: 'Doc Workflow Agent', status: 'IDLE', efficiency: '96%', load: '0 events/hr', health: 'STANDBY' },
  ];

  return (
    <div className="p-10 space-y-10 animate-in fade-in duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black tracking-tighter uppercase mb-2">Agent Operations Center</h2>
          <p className="text-gray-500 font-medium italic">OpenClaw Assistive Orchestration Layer • v1.0.4-beta</p>
        </div>
        <div className="flex gap-4">
           <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
              <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Human-in-the-loop Rate</p>
              <p className="text-xl font-black">100%</p>
           </div>
           <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
              <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Agent Accuracy</p>
              <p className="text-xl font-black text-emerald-400">92.8%</p>
           </div>
        </div>
      </div>

      {/* Active Agents Grid */}
      <div className="grid grid-cols-4 gap-6">
        {agents.map((agent) => (
          <div key={agent.name} className="bg-[#0A111F] p-6 rounded-3xl border border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4">
               <div className={`w-2 h-2 rounded-full ${agent.health === 'OPTIMAL' ? 'bg-emerald-500 animate-pulse' : 'bg-blue-500'}`} />
            </div>
            <BrainCircuit className="text-blue-500 mb-6 group-hover:scale-110 transition-transform" size={32} />
            <h3 className="font-bold mb-1">{agent.name}</h3>
            <p className="text-[10px] text-gray-500 font-black uppercase mb-4 tracking-widest">{agent.status}</p>
            
            <div className="grid grid-cols-2 gap-4 mt-6">
               <div>
                  <p className="text-[8px] font-bold text-gray-600 uppercase">Efficiency</p>
                  <p className="text-sm font-black">{agent.efficiency}</p>
               </div>
               <div>
                  <p className="text-[8px] font-bold text-gray-600 uppercase">Load</p>
                  <p className="text-sm font-black">{agent.load}</p>
               </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recommendations Table */}
      <div className="bg-[#0A111F] rounded-3xl border border-white/5 overflow-hidden">
        <div className="p-8 border-b border-white/5 flex justify-between items-center">
          <h3 className="text-xl font-bold flex items-center gap-3">
            <ShieldCheck className="text-blue-500" />
            Agent Action Center
            <span className="bg-blue-500/10 text-blue-500 text-[10px] px-2 py-0.5 rounded-full">{recommendations.length} Pending</span>
          </h3>
          <div className="flex gap-2">
             <div className="relative">
                <Search className="absolute left-3 top-2.5 text-gray-500" size={14} />
                <input className="bg-white/5 border-none rounded-xl pl-10 pr-4 py-2 text-xs font-bold w-64 focus:ring-1 ring-blue-500 transition-all" placeholder="Search recommendations..." />
             </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-white/5">
                <th className="px-8 py-5">Agent / Entity</th>
                <th className="px-8 py-5">Recommendation</th>
                <th className="px-8 py-5">Confidence</th>
                <th className="px-8 py-5">Reasoning</th>
                <th className="px-8 py-5">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-gray-500 font-bold uppercase tracking-widest animate-pulse">
                    Orchestrating agent insights...
                  </td>
                </tr>
              ) : recommendations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-gray-500 font-bold uppercase tracking-widest">
                    No recommendations requiring attention.
                  </td>
                </tr>
              ) : recommendations.map((rec) => (
                <tr key={rec.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                        <Bot size={20} />
                      </div>
                      <div>
                        <p className="text-xs font-black uppercase text-gray-600">{rec.agent_id.split('_')[1]}</p>
                        <p className="text-sm font-bold">{rec.entity_type}: {rec.entity_id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <p className="text-sm font-medium">{rec.recommendation_type.replace('_', ' ')}</p>
                    <p className="text-[10px] text-gray-500 mt-1">{JSON.stringify(rec.content).substring(0, 50)}...</p>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                       <span className={`text-sm font-black ${rec.confidence > 0.9 ? 'text-emerald-400' : 'text-blue-400'}`}>
                          {(rec.confidence * 100).toFixed(1)}%
                       </span>
                       <div className="w-12 h-1 bg-white/10 rounded-full">
                          <div className={`h-full rounded-full ${rec.confidence > 0.9 ? 'bg-emerald-400' : 'bg-blue-400'}`} style={{ width: `${rec.confidence * 100}%` }} />
                       </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <p className="text-xs text-gray-400 line-clamp-2 max-w-xs">{rec.reasoning}</p>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleApprove(rec.id)}
                        className="p-2 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white rounded-lg transition-all"
                      >
                        <CheckCircle2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleReject(rec.id)}
                        className="p-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-lg transition-all"
                      >
                        <XCircle size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AgentOps;
