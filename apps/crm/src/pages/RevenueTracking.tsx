import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, BarChart, ArrowUpRight } from 'lucide-react';
import supabase from '../services/supabaseClient';

export default function RevenueTracking() {
  const [revenues, setRevenues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRevenues();
  }, []);

  const fetchRevenues = async () => {
    try {
      const { data, error } = await supabase
        .from('revenues')
        .select(`
          *,
          customers(name),
          lenders(lender_name)
        `)
        .order('earned_at', { ascending: false });
      
      if (error) throw error;
      setRevenues(data || []);
    } catch (error) {
      console.error('Error fetching revenues:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalRevenue = revenues.reduce((acc, curr) => acc + (Number(curr.revenue_earned) || 0), 0);
  const receivedRevenue = revenues.filter(r => r.revenue_status === 'Received').reduce((acc, curr) => acc + (Number(curr.revenue_earned) || 0), 0);
  const pendingRevenue = totalRevenue - receivedRevenue;

  return (
    <div className="p-8 h-full overflow-y-auto bg-slate-50">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-green-600" />
            Revenue Tracking
          </h1>
          <p className="text-slate-500 mt-1">Track income generated from forwarded leads</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Total Revenue</p>
              <h3 className="text-3xl font-bold text-slate-900">₹{totalRevenue.toLocaleString()}</h3>
            </div>
            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Received Revenue</p>
              <h3 className="text-3xl font-bold text-slate-900">₹{receivedRevenue.toLocaleString()}</h3>
            </div>
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Pending Revenue</p>
              <h3 className="text-3xl font-bold text-slate-900">₹{pendingRevenue.toLocaleString()}</h3>
            </div>
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center">
              <BarChart className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <h2 className="font-semibold text-slate-800">Recent Transactions</h2>
        </div>
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading revenues...</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm">
                <th className="p-4 font-semibold">Date</th>
                <th className="p-4 font-semibold">Customer</th>
                <th className="p-4 font-semibold">Lender</th>
                <th className="p-4 font-semibold">Loan Details</th>
                <th className="p-4 font-semibold">Revenue Earned</th>
                <th className="p-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {revenues.map((rev) => (
                <tr key={rev.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="p-4 text-slate-700">{new Date(rev.earned_at).toLocaleDateString()}</td>
                  <td className="p-4 font-medium text-slate-900">{rev.customers?.name || 'Unknown'}</td>
                  <td className="p-4 text-slate-700">{rev.lenders?.lender_name || 'Unknown'}</td>
                  <td className="p-4">
                    <div className="text-sm text-slate-900">{rev.loan_type}</div>
                    <div className="text-xs text-slate-500">₹{rev.loan_amount?.toLocaleString()}</div>
                  </td>
                  <td className="p-4 font-semibold text-green-600">₹{rev.revenue_earned?.toLocaleString()}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${rev.revenue_status === 'Received' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {rev.revenue_status}
                    </span>
                  </td>
                </tr>
              ))}
              {revenues.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">No revenue data available.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
