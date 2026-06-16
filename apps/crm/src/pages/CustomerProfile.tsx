import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, User, Phone, Mail, Calendar, MapPin, Briefcase, Building, 
  DollarSign, CreditCard, PieChart, Activity, CheckCircle2, Clock, 
  FileText, Plus, Shield, MessageSquare
} from 'lucide-react';
import { customerService } from '../services/supabaseClient';
import AIChatAssistant from '../components/AIChatAssistant';

interface CustomerProfileProps {
  customerId: string;
  onBack: () => void;
}

export default function CustomerProfile({ customerId, onBack }: CustomerProfileProps) {
  const [customer, setCustomer] = useState<any>(null);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('DETAILS');

  useEffect(() => {
    fetchCustomerData();
  }, [customerId]);

  const fetchCustomerData = async () => {
    setLoading(true);
    try {
      const { data: cData } = await customerService.getCustomerById(customerId);
      const { data: tData } = await customerService.getTimeline(customerId);
      
      setCustomer(cData);
      setTimeline(tData || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center text-slate-500">
        <Loader2 className="animate-spin text-blue-500 mr-3" />
        Loading Profile...
      </div>
    );
  }

  if (!customer) return <div>Customer not found.</div>;

  return (
    <div className="h-full flex flex-col bg-slate-50 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-6">
        <button onClick={onBack} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 mb-4 transition-colors">
          <ArrowLeft size={16} /> Back to Customers
        </button>
        
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center text-2xl font-black">
              {customer.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900">{customer.name}</h1>
              <div className="flex items-center gap-3 mt-1">
                <p className="text-slate-500 font-medium">{customer.phone}</p>
                {customer.primary_goal && (
                  <span className="px-2.5 py-0.5 bg-purple-100 text-purple-700 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    Goal: {customer.primary_goal}
                  </span>
                )}
                {(customer.tags || []).map((tag: string, i: number) => (
                  <span key={i} className="px-2.5 py-0.5 bg-slate-100 text-slate-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Borrow Readiness</p>
            <div className="flex items-center gap-3">
              <div className="text-3xl font-black text-slate-900">
                {customer.borrow_readiness_score || '--'}<span className="text-lg text-slate-400">/100</span>
              </div>
              <div className={`w-3 h-3 rounded-full ${
                (customer.borrow_readiness_score || 0) >= 80 ? 'bg-emerald-500' :
                (customer.borrow_readiness_score || 0) >= 50 ? 'bg-orange-500' : 'bg-red-500'
              }`} />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="px-8 border-b border-slate-200 bg-white">
        <div className="flex gap-8">
          {['DETAILS', 'TIMELINE', 'LOAN HEALTH', 'DOCUMENTS', 'CONSULTATIONS'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 text-[11px] font-bold uppercase tracking-widest border-b-2 transition-colors ${
                activeTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-8 relative">
        <div className="max-w-6xl mx-auto space-y-6">
          
          {activeTab === 'DETAILS' && (
            <div className="grid grid-cols-2 gap-6">
              {/* Personal */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                  <User className="text-blue-500" size={20} />
                  <h3 className="font-bold text-slate-900">Personal Details</h3>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase">WhatsApp</p>
                    <p className="font-medium text-slate-800">{customer.whatsapp || customer.phone}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase">Email</p>
                    <p className="font-medium text-slate-800">{customer.email}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase">DOB</p>
                    <p className="font-medium text-slate-800">{customer.dob || '--'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase">Location</p>
                    <p className="font-medium text-slate-800">{customer.city ? `${customer.city}, ${customer.state}` : '--'}</p>
                  </div>
                </div>
              </div>

              {/* Professional */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                  <Briefcase className="text-purple-500" size={20} />
                  <h3 className="font-bold text-slate-900">Professional Details</h3>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase">Employment</p>
                    <p className="font-medium text-slate-800">{customer.employment_type || '--'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase">Employer</p>
                    <p className="font-medium text-slate-800">{customer.employer_name || '--'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase">Designation</p>
                    <p className="font-medium text-slate-800">{customer.designation || '--'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase">Experience</p>
                    <p className="font-medium text-slate-800">{customer.experience_years ? `${customer.experience_years} Years` : '--'}</p>
                  </div>
                </div>
              </div>

              {/* Financial */}
              <div className="col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                  <DollarSign className="text-emerald-500" size={20} />
                  <h3 className="font-bold text-slate-900">Financial Details</h3>
                </div>
                <div className="grid grid-cols-5 gap-6">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase">Monthly Income</p>
                    <p className="text-xl font-black text-slate-800">₹{(customer.monthly_income || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase">EMI Burden</p>
                    <p className="text-xl font-black text-orange-600">₹{(customer.emi_obligations || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase">Credit Score</p>
                    <p className="text-xl font-black text-slate-800">{customer.credit_score || '--'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase">Active Loans</p>
                    <p className="text-xl font-black text-slate-800">{customer.existing_loans_count || 0}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase">CC Outstanding</p>
                    <p className="text-xl font-black text-slate-800">₹{(customer.credit_card_outstanding || 0).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'TIMELINE' && (
            <div className="max-w-2xl bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
              <h3 className="font-black text-lg mb-8 uppercase tracking-tighter">Chronological History</h3>
              <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                {timeline.map((event, index) => (
                  <div key={event.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-blue-100 text-blue-600 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10">
                      <Activity size={16} />
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl border border-slate-200 bg-slate-50 shadow-sm">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-bold text-sm text-slate-900">{event.event_type}</h4>
                        <time className="text-[10px] font-bold text-slate-400">{new Date(event.event_date).toLocaleDateString()}</time>
                      </div>
                      <p className="text-sm text-slate-600">{event.description}</p>
                    </div>
                  </div>
                ))}
                {timeline.length === 0 && (
                  <p className="text-center text-slate-500 font-medium py-10 relative z-10 bg-white">No timeline events yet.</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'LOAN HEALTH' && (
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                 <h3 className="font-black text-xl mb-6">Financial Fitness Radar</h3>
                 <div className="space-y-6">
                    {[
                      { label: 'Income Stability', key: 'income_stability', color: 'blue' },
                      { label: 'Credit Behaviour', key: 'credit_behaviour', color: 'purple' },
                      { label: 'EMI Burden', key: 'emi_burden', color: 'orange' },
                      { label: 'Documentation Readiness', key: 'documentation', color: 'emerald' },
                    ].map(metric => (
                      <div key={metric.key} className="space-y-2">
                        <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-slate-500">
                          <span>{metric.label}</span>
                          <span className="text-slate-900">{customer.loan_health_metrics?.[metric.key] || 0}/10</span>
                        </div>
                        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full bg-${metric.color}-500 rounded-full`} 
                            style={{ width: `${((customer.loan_health_metrics?.[metric.key] || 0) / 10) * 100}%` }} 
                          />
                        </div>
                      </div>
                    ))}
                 </div>
              </div>
              <div className="bg-blue-50 p-8 rounded-3xl border border-blue-100 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <Shield className="text-blue-600" />
                  <h3 className="font-black text-xl text-blue-900">AI Recommendations</h3>
                </div>
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-blue-50">
                    <h4 className="font-bold text-sm text-slate-900">Reduce EMI Burden</h4>
                    <p className="text-xs text-slate-600 mt-1">Current FOIR is slightly high. Recommend paying off the credit card outstanding to improve eligibility for a home loan.</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-blue-50">
                    <h4 className="font-bold text-sm text-slate-900">Documentation Gap</h4>
                    <p className="text-xs text-slate-600 mt-1">Missing latest 3 months Salary Slips. Request these before submitting the application to HDFC.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'DOCUMENTS' && (
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-center mb-8">
                <h3 className="font-black text-xl">Document Vault</h3>
                <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm hover:bg-blue-700">
                  <Plus size={16} /> Request Document
                </button>
              </div>
              <div className="grid grid-cols-4 gap-4">
                {['PAN Card', 'Aadhaar Card', 'Salary Slips (3M)', 'Bank Statement (6M)', 'ITR (2 Yrs)'].map((doc, i) => (
                  <div key={i} className="border border-slate-200 rounded-2xl p-5 flex flex-col items-center justify-center text-center gap-3 hover:border-blue-300 transition-colors cursor-pointer group">
                    <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-blue-500 group-hover:bg-blue-50 transition-colors">
                      <FileText size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{doc}</h4>
                      <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest mt-1">Pending Upload</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
        </div>
      </div>
      
      {/* Floating AI Assistant */}
      <AIChatAssistant contextData={customer} />

    </div>
  );
}

// Dummy loader to fix unresolved import
const Loader2 = ({ className, size }: { className?: string, size?: number }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
);
