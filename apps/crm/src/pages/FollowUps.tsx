import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle2, Clock, XCircle, Search } from 'lucide-react';
import supabase from '../services/supabaseClient';

export default function FollowUps() {
  const [followups, setFollowups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFollowUps();
  }, []);

  const fetchFollowUps = async () => {
    try {
      const { data, error } = await supabase
        .from('followups')
        .select(`
          *,
          customers(name, phone)
        `)
        .order('follow_up_date', { ascending: true });
      
      if (error) throw error;
      setFollowups(data || []);
    } catch (error) {
      console.error('Error fetching follow-ups:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase.from('followups').update({ status }).eq('id', id);
      if (error) throw error;
      fetchFollowUps();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'Completed': return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'Missed': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <Clock className="w-5 h-5 text-amber-500" />;
    }
  };

  return (
    <div className="p-8 h-full overflow-y-auto bg-slate-50">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-blue-600" />
            Follow Ups
          </h1>
          <p className="text-slate-500 mt-1">Manage scheduled calls and interactions</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Today's Follow Ups</p>
            <h3 className="text-2xl font-bold text-slate-900">{followups.filter(f => f.status === 'Pending' && new Date(f.follow_up_date).toDateString() === new Date().toDateString()).length}</h3>
          </div>
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Overdue Follow Ups</p>
            <h3 className="text-2xl font-bold text-slate-900">{followups.filter(f => f.status === 'Pending' && new Date(f.follow_up_date) < new Date(new Date().toDateString())).length}</h3>
          </div>
          <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center">
            <XCircle className="w-6 h-6" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Completed (This Month)</p>
            <h3 className="text-2xl font-bold text-slate-900">{followups.filter(f => f.status === 'Completed').length}</h3>
          </div>
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading follow ups...</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm">
                <th className="p-4 font-semibold w-12"></th>
                <th className="p-4 font-semibold">Customer</th>
                <th className="p-4 font-semibold">Scheduled For</th>
                <th className="p-4 font-semibold">Remarks</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {followups.map((follow) => (
                <tr key={follow.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="p-4 text-center">
                    {getStatusIcon(follow.status)}
                  </td>
                  <td className="p-4">
                    <div className="font-semibold text-slate-900">{follow.customers?.name || 'Unknown'}</div>
                    <div className="text-xs text-slate-500">{follow.customers?.phone}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-slate-900">{new Date(follow.follow_up_date).toLocaleDateString()}</div>
                    <div className="text-xs text-slate-500">{follow.follow_up_time || 'No Time Set'}</div>
                  </td>
                  <td className="p-4 text-slate-700 text-sm max-w-xs truncate">
                    {follow.remarks}
                  </td>
                  <td className="p-4 text-right space-x-2">
                    {follow.status === 'Pending' && (
                      <>
                        <button onClick={() => updateStatus(follow.id, 'Completed')} className="px-3 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-lg hover:bg-green-100 transition-colors">Mark Done</button>
                        <button onClick={() => updateStatus(follow.id, 'Missed')} className="px-3 py-1 bg-red-50 text-red-700 text-xs font-medium rounded-lg hover:bg-red-100 transition-colors">Missed</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {followups.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">No scheduled follow-ups.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
