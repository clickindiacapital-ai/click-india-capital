import React from 'react';
import { Wallet, BrainCircuit, ShieldAlert, Zap } from 'lucide-react';

interface StatsGridProps {
  leadsCount: number;
}

const StatsGrid: React.FC<StatsGridProps> = ({ leadsCount }) => {
  const stats = [
    { label: 'Total Debt Managed', value: '₹482 Cr', change: '+12.5%', color: 'blue', icon: Wallet },
    { label: 'Active Intelligence', value: leadsCount.toString(), change: '+₹49', color: 'emerald', icon: BrainCircuit },
    { label: 'Retention Risk', value: '14 Cases', change: 'Critical', color: 'red', icon: ShieldAlert },
    { label: 'Transformation Rate', value: '32.4%', change: '+2.1%', color: 'purple', icon: Zap },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
      {stats.map((stat) => (
        <div key={stat.label} className="bg-[#0A111F] p-6 rounded-2xl border border-white/5 group hover:border-blue-500/30 transition-all relative overflow-hidden">
          <stat.icon className="absolute -right-2 -bottom-2 text-white/5 w-20 h-20" />
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 relative z-10">{stat.label}</p>
          <div className="flex items-baseline gap-2 relative z-10">
            <h3 className="text-2xl font-black">{stat.value}</h3>
            <span className={`text-[10px] font-bold ${stat.change.startsWith('+') ? 'text-emerald-400' : 'text-red-400'}`}>
              {stat.change}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsGrid;
