import React, { useEffect, useState } from 'react';
import { paymentService } from '../services/supabaseClient';
import { CheckCircle, XCircle, Clock, ExternalLink, ShieldCheck, Wallet } from 'lucide-react';

const PaymentVerificationDesk = () => {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const { data, error } = await paymentService.getPendingVerifications();
      if (error) throw error;
      setSubmissions(data || []);
    } catch (err) {
      console.error('Failed to fetch payment submissions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      // For now using a system admin ID
      const adminId = '00000000-0000-0000-0000-000000000000';
      await paymentService.verifyManualPayment(id, status, adminId);
      setSubmissions(prev => prev.filter(s => s.id !== id));
      alert(`Payment ${status === 'APPROVED' ? 'Approved' : 'Rejected'} Successfully`);
    } catch (err) {
      console.error('Verification failed:', err);
      alert('Action failed. Please check logs.');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-black uppercase tracking-tighter">Payment Verification Desk</h3>
          <p className="text-gray-500 font-medium">Reviewing {submissions.length} pending UPI submissions</p>
        </div>
      </div>

      {isLoading ? (
        <div className="h-64 flex items-center justify-center bg-[#0A111F] rounded-[40px] border border-white/5 animate-pulse">
           <p className="text-xs font-black uppercase tracking-widest text-gray-500">Synchronizing Ledger...</p>
        </div>
      ) : submissions.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center bg-[#0A111F] rounded-[40px] border border-white/5 text-center">
           <ShieldCheck size={48} className="text-emerald-500 mb-4 opacity-20" />
           <p className="text-xs font-black uppercase tracking-widest text-gray-500">All payments are currently settled</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {submissions.map((sub) => (
            <div key={sub.id} className="bg-[#0A111F] p-8 rounded-[40px] border border-white/5 hover:border-blue-500/30 transition-all flex items-center justify-between group">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-500">
                   <Wallet size={28} />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h4 className="text-lg font-black uppercase tracking-tight">₹{sub.amount.toLocaleString()}</h4>
                    <span className="px-2 py-0.5 bg-orange-500/10 text-orange-500 text-[8px] font-black uppercase rounded-full">Pending Verification</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-medium text-gray-500">
                    <span>UTR: <span className="text-white font-bold">{sub.utr_number}</span></span>
                    <span className="w-1 h-1 bg-white/10 rounded-full" />
                    <span>Phone: <span className="text-white font-bold">{sub.phone || sub.users?.phone}</span></span>
                    <span className="w-1 h-1 bg-white/10 rounded-full" />
                    <span>User: <span className="text-white font-bold">{sub.payer_name || sub.users?.full_name || 'Guest'}</span></span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button className="p-3 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl transition-all" title="View Proof">
                   <ExternalLink size={18} />
                </button>
                <button 
                  onClick={() => handleVerify(sub.id, 'REJECTED')}
                  className="px-6 py-3 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border border-red-600/20"
                >
                   Reject
                </button>
                <button 
                  onClick={() => handleVerify(sub.id, 'APPROVED')}
                  className="px-8 py-3 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-emerald-900/20 hover:bg-emerald-500"
                >
                   Approve Payment
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PaymentVerificationDesk;
