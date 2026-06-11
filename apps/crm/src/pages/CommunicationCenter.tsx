import { useState, useEffect, useRef } from 'react';
import { 
  communicationService, 
  leadService, 
  intelligenceService,
  paymentService 
} from '../services/supabaseClient';
import { 
  LeadData, 
  CustomerMessage, 
  MessagePriority, 
  EscalationState 
} from '@click-india/shared-types';
import { 
  Search, 
  Send, 
  Paperclip, 
  MoreVertical, 
  ShieldAlert, 
  Clock, 
  CheckCircle2, 
  User,
  Bot,
  MessageSquare,
  Filter,
  ArrowUpRight,
  ChevronRight,
  CreditCard,
  History,
  CheckCircle,
  XCircle,
  ExternalLink
} from 'lucide-react';

const CommunicationCenter = () => {
  const [activeTab, setActiveTab] = useState<'MESSAGES' | 'PAYMENTS'>('MESSAGES');
  const [payments, setPayments] = useState<any[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [leads, setLeads] = useState<LeadData[]>([]);
  const [unreadSummaries, setUnreadSummaries] = useState<any[]>([]);
  const [activeLead, setActiveLead] = useState<LeadData | null>(null);
  const [messages, setMessages] = useState<CustomerMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        const [leadsRes, unreadRes, paymentsRes] = await Promise.all([
          leadService.getAllLeads(),
          communicationService.getUnreadSummaries(),
          paymentService.getPendingVerifications()
        ]);
        
        setLeads(leadsRes.data || []);
        setUnreadSummaries(unreadRes.data || []);
        setPayments(paymentsRes.data || []);
      } catch (err) {
        console.error('Failed to load communication data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  useEffect(() => {
    if (activeLead) {
      const fetchMessages = async () => {
        const { data } = await communicationService.getMessagesForLead(activeLead.id!);
        setMessages(data || []);
        
        // Mark as read
        const unreadIds = (data || [])
          .filter(m => !m.is_read && m.sender_type === 'CUSTOMER')
          .map(m => m.id);
        if (unreadIds.length > 0) {
          await communicationService.markAsRead(unreadIds);
        }
      };
      fetchMessages();

      // Realtime subscription
      const subscription = (communicationService as any).supabase
        .channel(`lead-messages-${activeLead.id}`)
        .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'customer_messages',
          filter: `lead_id=eq.${activeLead.id}`
        }, (payload: any) => {
          setMessages(prev => [...prev, payload.new]);
        })
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [activeLead]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !activeLead) return;

    const newMessage = {
      customer_id: activeLead.customer_id!,
      lead_id: activeLead.id!,
      sender_id: '00000000-0000-0000-0000-000000000000', // SYSTEM/ADMIN
      sender_type: 'AGENT' as const,
      content: inputMessage,
      message_type: 'TEXT' as const,
      message_priority: 'NORMAL' as const,
    };

    const { data } = await communicationService.sendMessage(newMessage);
    if (data) {
      setInputMessage('');
    }
  };

  const handleVerifyPayment = async (submissionId: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      // Use system admin ID for pilot
      const adminId = '00000000-0000-0000-0000-000000000000';
      await paymentService.verifyManualPayment(submissionId, status, adminId);
      
      // Update local state
      setPayments(prev => prev.filter(p => p.id !== submissionId));
      
      // If approved, refresh leads to show updated lifecycle stage
      if (status === 'APPROVED') {
         const { data } = await leadService.getAllLeads();
         setLeads(data || []);
      }
    } catch (err) {
      console.error('Payment verification failed:', err);
    }
  };

  const getUnreadCount = (leadId: string) => {
    return unreadSummaries.find(s => s.lead_id === leadId)?.unread_count || 0;
  };

  const getPeakPriority = (leadId: string) => {
    return unreadSummaries.find(s => s.lead_id === leadId)?.peak_priority_level || 0;
  };

  return (
    <div className="flex h-full bg-[#050B14] rounded-3xl border border-white/5 overflow-hidden">
      {/* Lead List Sidebar */}
      <div className="w-80 border-r border-white/5 flex flex-col bg-[#0A111F]/50">
        <div className="p-6 border-b border-white/5 space-y-6">
          <div className="flex bg-white/2 p-1 rounded-2xl border border-white/5">
             <button 
               onClick={() => setActiveTab('MESSAGES')}
               className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'MESSAGES' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'text-gray-500 hover:text-gray-400'}`}
             >
               Messages
             </button>
             <button 
               onClick={() => setActiveTab('PAYMENTS')}
               className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all relative ${activeTab === 'PAYMENTS' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'text-gray-500 hover:text-gray-400'}`}
             >
               Payments
               {payments.length > 0 && (
                 <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center text-[8px] font-black">
                   {payments.length}
                 </span>
               )}
             </button>
          </div>

          <div className="flex items-center justify-between">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-gray-500">Pipeline</h2>
            <button className="p-2 hover:bg-white/5 rounded-lg text-gray-500">
              <Filter size={16} />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={14} />
            <input 
              placeholder="Search leads..."
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-9 pr-4 text-xs outline-none focus:border-blue-600 transition-all placeholder:text-gray-700"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {isLoading ? (
            <div className="p-10 text-center animate-pulse text-gray-600 text-xs font-bold uppercase tracking-widest">
              Synchronizing...
            </div>
          ) : leads.map((lead) => {
            const unread = getUnreadCount(lead.id!);
            const priority = getPeakPriority(lead.id!);
            const isActive = activeLead?.id === lead.id;

            return (
              <button
                key={lead.id}
                onClick={() => setActiveLead(lead)}
                className={`w-full p-4 flex items-start gap-4 transition-all border-b border-white/5 hover:bg-white/[0.02] ${isActive ? 'bg-blue-600/5 border-r-2 border-r-blue-600' : ''}`}
              >
                <div className="relative">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs ${isActive ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-500'}`}>
                    {lead.phone.slice(-2)}
                  </div>
                  {unread > 0 && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center text-[8px] font-black shadow-lg shadow-blue-900/40">
                      {unread}
                    </div>
                  )}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <p className={`text-sm font-bold truncate ${unread > 0 ? 'text-white' : 'text-gray-400'}`}>{lead.phone}</p>
                    <span className="text-[8px] text-gray-600 font-bold whitespace-nowrap">12:45 PM</span>
                  </div>
                  <p className="text-[10px] text-gray-500 truncate font-medium">₹{(lead.loan_amount / 100000).toFixed(1)}L • {lead.loan_type}</p>
                  {priority > 1 && (
                    <div className="flex items-center gap-1 mt-2">
                      <ShieldAlert size={10} className="text-red-500" />
                      <span className="text-[8px] font-black text-red-500 uppercase tracking-widest">High Priority</span>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col relative bg-gradient-to-b from-[#0A111F] to-[#050B14]">
        {activeLead ? (
          <>
            {/* Chat Header */}
            <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-[#0A111F]/80 backdrop-blur-md">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-600/10 rounded-xl flex items-center justify-center text-blue-500">
                  <User size={20} />
                </div>
                <div>
                  <h3 className="text-base font-black tracking-tight">{activeLead.phone}</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Active Consultation</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-all text-gray-400">
                  <ShieldAlert size={18} />
                </button>
                <button className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-all text-gray-400">
                  <MoreVertical size={18} />
                </button>
              </div>
            </header>

            {/* Message Stream */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide">
              {messages.map((msg) => {
                const isCustomer = msg.sender_type === 'CUSTOMER';
                const isAI = msg.sender_type === 'AI_AGENT';

                return (
                  <div key={msg.id} className={`flex ${isCustomer ? 'justify-start' : 'justify-end'} group animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                    <div className={`max-w-[70%] ${isCustomer ? 'order-2' : 'order-1'}`}>
                      <div className={`p-4 rounded-2xl text-sm font-medium leading-relaxed ${
                        isCustomer 
                          ? 'bg-[#151D2C] text-gray-200 rounded-tl-none border border-white/5' 
                          : isAI 
                            ? 'bg-blue-600/20 text-blue-100 rounded-tr-none border border-blue-500/20'
                            : 'bg-blue-600 text-white rounded-tr-none shadow-lg shadow-blue-900/20'
                      }`}>
                        {msg.content}
                      </div>
                      <div className={`flex items-center gap-2 mt-2 px-1 ${isCustomer ? 'justify-start' : 'justify-end'}`}>
                        {isAI && <Bot size={12} className="text-blue-400" />}
                        <span className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {!isCustomer && <CheckCircle2 size={12} className="text-blue-500" />}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={scrollRef} />
            </div>

            {/* Input Area */}
            {activeTab === 'MESSAGES' ? (
              <div className="p-8 border-t border-white/5 bg-[#0A111F]/50">
                <div className="max-w-4xl mx-auto flex items-end gap-4">
                  <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-2 focus-within:border-blue-600 transition-all">
                    <textarea 
                      rows={1}
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
                      placeholder="Assist customer with strategy..."
                      className="w-full bg-transparent border-none outline-none text-sm font-medium py-2 px-3 resize-none max-h-32 scrollbar-hide"
                    />
                    <div className="flex items-center justify-between px-2 pt-2 border-t border-white/5 mt-2">
                      <div className="flex gap-2">
                        <button className="p-1.5 hover:bg-white/5 rounded-lg text-gray-500 transition-colors">
                          <Paperclip size={16} />
                        </button>
                        <button className="p-1.5 hover:bg-white/5 rounded-lg text-gray-500 transition-colors">
                          <Bot size={16} />
                        </button>
                      </div>
                      <button 
                        onClick={handleSendMessage}
                        disabled={!inputMessage.trim()}
                        className={`p-2 rounded-xl transition-all ${inputMessage.trim() ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'bg-white/5 text-gray-600'}`}
                      >
                        <Send size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-12 bg-black/20">
                <div className="max-w-5xl mx-auto space-y-12">
                   <div className="space-y-2">
                      <h3 className="text-3xl font-black tracking-tighter uppercase">Payment Verification Queue</h3>
                      <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em]">Institutional Trust Validation</p>
                   </div>

                   <div className="grid grid-cols-1 gap-6">
                      {payments.length === 0 ? (
                        <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-[40px]">
                           <CheckCircle className="mx-auto text-emerald-500/20 mb-4" size={48} />
                           <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest">Queue Clear</p>
                        </div>
                      ) : payments.map(payment => (
                        <div key={payment.id} className="bg-[#0A111F] border border-white/5 rounded-[40px] p-10 flex items-center justify-between group hover:border-blue-600/30 transition-all">
                           <div className="flex items-center gap-10">
                              <div className="w-20 h-20 bg-blue-600/5 rounded-[32px] flex items-center justify-center text-blue-500">
                                 <CreditCard size={32} />
                              </div>
                              <div className="space-y-3">
                                 <div className="flex items-center gap-3">
                                    <span className="text-2xl font-black italic">₹{payment.amount}</span>
                                    <span className="px-3 py-1 bg-white/5 rounded-full text-[8px] font-black uppercase tracking-widest text-gray-500">UTR: {payment.utr_number}</span>
                                 </div>
                                 <div className="flex items-center gap-4 text-xs font-medium text-gray-500">
                                    <span className="flex items-center gap-2 text-white font-bold"><User size={14} /> {payment.payer_name || payment.users?.full_name || 'Guest'}</span>
                                    <span>•</span>
                                    <span>{payment.phone || payment.users?.phone}</span>
                                    <span>•</span>
                                    <span className="flex items-center gap-2"><Clock size={14} /> {new Date(payment.created_at).toLocaleString()}</span>
                                 </div>
                              </div>
                           </div>
                           
                           <div className="flex gap-4 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                              <button 
                                onClick={() => handleVerifyPayment(payment.id, 'REJECTED')}
                                className="h-14 px-8 border border-white/5 hover:bg-red-500/10 hover:text-red-500 text-gray-500 font-black uppercase text-[10px] tracking-widest rounded-2xl transition-all"
                              >
                                Reject
                              </button>
                              <button 
                                onClick={() => handleVerifyPayment(payment.id, 'APPROVED')}
                                className="h-14 px-8 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl transition-all shadow-lg shadow-emerald-900/20"
                              >
                                Approve & Unlock
                              </button>
                           </div>
                        </div>
                      ))}
                   </div>

                   <section className="pt-12 space-y-6">
                      <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2"><History size={14} /> Recent Verifications</h4>
                      <div className="grid grid-cols-2 gap-4 opacity-40 grayscale">
                         {/* Simulation of recently verified payments */}
                         <div className="p-6 border border-white/5 rounded-[32px] bg-white/2 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                               <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500"><CheckCircle size={18} /></div>
                               <div>
                                  <p className="text-xs font-black uppercase italic">₹1500 Approved</p>
                                  <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest">UTR: 3456...7890</p>
                               </div>
                            </div>
                            <ExternalLink size={14} className="text-gray-700" />
                         </div>
                         <div className="p-6 border border-white/5 rounded-[32px] bg-white/2 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                               <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center text-red-500"><XCircle size={18} /></div>
                               <div>
                                  <p className="text-xs font-black uppercase italic">₹49 Rejected</p>
                                  <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest">Invalid UTR</p>
                               </div>
                            </div>
                            <ExternalLink size={14} className="text-gray-700" />
                         </div>
                      </div>
                   </section>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-10">
            <div className="w-20 h-20 bg-blue-600/5 rounded-[32px] flex items-center justify-center text-blue-500/20 mb-6">
              <MessageSquare size={40} />
            </div>
            <h3 className="text-xl font-black tracking-tighter uppercase mb-2">Communication Center</h3>
            <p className="text-gray-500 max-w-xs text-sm font-medium leading-relaxed">
              Select a lead from the pipeline to begin providing strategic financial assistance.
            </p>
          </div>
        )}
      </div>

      {/* Context Sidebar (Calm Insights) */}
      {activeLead && (
        <div className="w-80 border-l border-white/5 p-8 bg-[#0A111F]/30 overflow-y-auto scrollbar-hide">
          <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-6">Recovery Context</h4>
          
          <div className="space-y-8">
            <section>
              <h5 className="text-xs font-bold text-white mb-4">Strategic Tier</h5>
              <div className="p-4 bg-blue-600/5 border border-blue-600/10 rounded-2xl">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Rehab Plan</span>
                  <span className="text-xs font-bold">₹1500</span>
                </div>
                <p className="text-[10px] text-gray-400 font-medium">DIAGNOSIS_49 product active. Focus on debt consolidation.</p>
              </div>
            </section>

            <section>
              <h5 className="text-xs font-bold text-white mb-4">AI Suggestions</h5>
              <div className="space-y-3">
                {[
                  "Acknowledge the high EMI burden of 68%",
                  "Suggest asset monetization for Creta",
                  "Explain the 50% settlement target"
                ].map((s, i) => (
                  <button key={i} className="w-full text-left p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl transition-all flex items-center justify-between group">
                    <span className="text-[10px] font-medium text-gray-400 group-hover:text-white transition-colors">{s}</span>
                    <ChevronRight size={12} className="text-gray-600 group-hover:text-blue-500 transition-colors" />
                  </button>
                ))}
              </div>
            </section>

            <section>
              <h5 className="text-xs font-bold text-white mb-4">Engagement Metrics</h5>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/2 p-3 rounded-xl border border-white/5">
                  <p className="text-[8px] font-black text-gray-500 uppercase mb-1">Responsiveness</p>
                  <p className="text-sm font-black text-emerald-400">High</p>
                </div>
                <div className="bg-white/2 p-3 rounded-xl border border-white/5">
                  <p className="text-[8px] font-black text-gray-500 uppercase mb-1">Sentiment</p>
                  <p className="text-sm font-black text-blue-400">Stable</p>
                </div>
              </div>
            </section>

            <button className="w-full py-4 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-blue-600/20">
              View Strategy Blueprint
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunicationCenter;
