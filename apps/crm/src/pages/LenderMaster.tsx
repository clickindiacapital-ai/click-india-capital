import React, { useState, useEffect } from 'react';
import { Plus, Edit2, ShieldCheck, Power, Search } from 'lucide-react';
import supabase from '../services/supabaseClient';

export default function LenderMaster() {
  const [lenders, setLenders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLenders();
  }, []);

  const fetchLenders = async () => {
    try {
      const { data, error } = await supabase.from('lenders').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setLenders(data || []);
    } catch (error) {
      console.error('Error fetching lenders:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase.from('lenders').update({ active: !currentStatus }).eq('id', id);
      if (error) throw error;
      fetchLenders();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  return (
    <div className="p-8 h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-blue-600" />
            Lender Master
          </h1>
          <p className="text-slate-500 mt-1">Manage lending partners and matchmaking rules</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="w-5 h-5" />
          Add Lender
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <div className="flex items-center gap-2 text-slate-500 bg-white border border-slate-300 px-3 py-1.5 rounded-lg w-80 focus-within:ring-2 focus-within:ring-blue-100 transition-shadow">
            <Search className="w-4 h-4" />
            <input type="text" placeholder="Search lenders..." className="bg-transparent border-none focus:outline-none w-full text-sm placeholder-slate-400" />
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading lenders...</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm">
                <th className="p-4 font-semibold">Lender Name</th>
                <th className="p-4 font-semibold">Loan Types</th>
                <th className="p-4 font-semibold">Min Income</th>
                <th className="p-4 font-semibold">Interest Rate</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {lenders.map((lender) => (
                <tr key={lender.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="p-4">
                    <div className="font-semibold text-slate-900">{lender.lender_name}</div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {lender.loan_type?.map((lt: string, i: number) => (
                        <span key={i} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">{lt}</span>
                      ))}
                    </div>
                  </td>
                  <td className="p-4 text-slate-700">₹{lender.min_income?.toLocaleString()}</td>
                  <td className="p-4 text-slate-700">{lender.interest_rate}%</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${lender.active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${lender.active ? 'bg-green-500' : 'bg-slate-400'}`}></span>
                      {lender.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <button className="text-slate-400 hover:text-blue-600 transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => toggleActive(lender.id, lender.active)}
                        className={`transition-colors ${lender.active ? 'text-slate-400 hover:text-red-600' : 'text-slate-400 hover:text-green-600'}`}
                      >
                        <Power className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {lenders.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">No lenders found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
