import React, { useState } from 'react';
import { 
  FileText, 
  Send, 
  Plus, 
  Trash2, 
  Target,
  ShieldCheck,
  Loader2,
  X
} from 'lucide-react';
import { blueprintService } from '../services/supabaseClient';

const BlueprintBuilder = ({ leadId, customerName, onClose }: { leadId: string; customerName: string; onClose: () => void }) => {
  const [summary, setSummary] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [settlements, setSettlements] = useState([
    { creditor: 'HDFC Bank (PL)', total_due: 450000, target_settlement: 180000 }
  ]);

  const addSettlement = () => setSettlements([...settlements, { creditor: '', total_due: 0, target_settlement: 0 }]);
  
  const updateSettlement = (index: number, field: string, value: any) => {
    const newSettlements = [...settlements];
    newSettlements[index] = { ...newSettlements[index], [field]: value };
    setSettlements(newSettlements);
  };

  const removeSettlement = (index: number) => {
    setSettlements(settlements.filter((_, i) => i !== index));
  };

  const totalDue = settlements.reduce((acc, curr) => acc + curr.total_due, 0);
  const totalSettlement = settlements.reduce((acc, curr) => acc + curr.target_settlement, 0);
  const totalSavings = totalDue - totalSettlement;

  const handlePublish = async () => {
    setIsSubmitting(true);
    try {
      await blueprintService.saveBlueprint({
        lead_id: leadId,
        strategy_summary: summary,
        recommended_settlements: settlements,
        refinance_plan: {
          total_due: totalDue,
          total_settlement: totalSettlement,
          total_savings: totalSavings
        },
        is_published: true
      });
      alert('Blueprint published successfully!');
      onClose();
    } catch (err) {
      console.error('Failed to publish blueprint:', err);
      alert('Failed to publish blueprint. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#080D18] rounded-[40px] border border-white/5 overflow-hidden shadow-3xl">
      {/* Guided Strategy Header */}
      <div className="p-10 border-b border-white/5 bg-white/2 flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-black tracking-tighter uppercase">Strategy Architect</h3>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Designing Path to Freedom for {customerName}</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={onClose}
            className="p-3 bg-white/5 rounded-2xl text-gray-500 hover:text-white transition-all"
          >
            <X size={20} />
          </button>
          <button 
            onClick={handlePublish}
            disabled={isSubmitting}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 transition-all shadow-2xl shadow-blue-900/40 disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
            Publish Strategy
          </button>
        </div>
      </div>

      <div className="p-10 space-y-12">
        {/* Strategy Summary */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
             <FileText size={16} className="text-blue-500" />
             <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Personal Recovery Notes</label>
          </div>
          <textarea 
            className="w-full bg-white/2 border border-white/5 rounded-[32px] p-8 text-sm font-medium outline-none focus:border-blue-500/50 transition-all min-h-[140px] leading-relaxed"
            placeholder={`How will we help ${customerName} today? Describe the recovery path in human terms...`}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
          />
        </div>

        {/* Settlement Matrix - Simplified */}
        <div className="space-y-6">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
               <Target size={16} className="text-orange-500" />
               <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Debt Negotiation Matrix</label>
            </div>
            <button onClick={addSettlement} className="text-[10px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-2">
              <Plus size={14} /> Add Creditor
            </button>
          </div>

          <div className="space-y-4">
            {settlements.map((s, i) => (
              <div key={i} className="flex gap-6 items-center p-6 bg-white/2 border border-white/5 rounded-3xl group">
                <div className="flex-1">
                  <input 
                    placeholder="Creditor Name" 
                    className="w-full bg-transparent outline-none text-lg font-black border-b border-transparent focus:border-blue-500/30 pb-1" 
                    value={s.creditor} 
                    onChange={(e) => updateSettlement(i, 'creditor', e.target.value)}
                  />
                  <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mt-2">Institution</p>
                </div>
                <div className="w-40 text-right">
                   <input 
                     type="number" 
                     className="w-full bg-transparent outline-none text-xl font-black text-right" 
                     value={s.total_due} 
                     onChange={(e) => updateSettlement(i, 'total_due', parseInt(e.target.value) || 0)}
                   />
                   <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mt-2">Total Due</p>
                </div>
                <div className="w-40 text-right">
                   <input 
                     type="number" 
                     className="w-full bg-transparent outline-none text-xl font-black text-emerald-500 text-right" 
                     value={s.target_settlement} 
                     onChange={(e) => updateSettlement(i, 'target_settlement', parseInt(e.target.value) || 0)}
                   />
                   <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest mt-2">Target</p>
                </div>
                <button 
                  onClick={() => removeSettlement(i)}
                  className="p-3 text-gray-700 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>

          {/* Impact Summary */}
          <div className="grid grid-cols-3 gap-6 pt-6">
            <div className="p-8 bg-white/2 border border-white/5 rounded-3xl text-center">
              <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest mb-2">Portfolio Total</p>
              <p className="text-3xl font-black italic">₹{totalDue.toLocaleString()}</p>
            </div>
            <div className="p-8 bg-blue-600/10 border border-blue-600/10 rounded-3xl text-center">
              <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest mb-2">Projected Savings</p>
              <p className="text-3xl font-black text-blue-500">₹{totalSavings.toLocaleString()}</p>
            </div>
            <div className="p-8 bg-emerald-500/10 border border-emerald-500/10 rounded-3xl text-center">
              <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest mb-2">Success Index</p>
              <p className="text-3xl font-black text-emerald-500">{((totalSavings / totalDue) * 100).toFixed(0)}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Support Notice */}
      <div className="p-10 bg-black/40 border-t border-white/5 flex items-center gap-6">
        <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 shrink-0">
           <ShieldCheck size={32} />
        </div>
        <p className="text-[10px] text-gray-500 font-bold uppercase leading-relaxed italic max-w-2xl">
          This strategy is a guided recovery document designed for human advocacy. 
          The goal is to restore financial dignity and credit health through institutional negotiation.
        </p>
      </div>
    </div>
  );
};

export default BlueprintBuilder;
