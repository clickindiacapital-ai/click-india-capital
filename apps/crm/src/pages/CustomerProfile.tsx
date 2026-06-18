import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, User, Phone, Mail, Calendar, MapPin, Briefcase, Building, 
  DollarSign, CreditCard, PieChart, Activity, CheckCircle2, Clock, 
  FileText, Plus, Shield, MessageSquare, Check, X as CloseIcon, Loader2
} from 'lucide-react';
import supabase, { customerService } from '../services/supabaseClient';
import AIChatAssistant from '../components/AIChatAssistant';

interface CustomerProfileProps {
  customerId: string;
  onBack: () => void;
}

const docLabels: Record<string, string> = {
  'PAN': 'PAN Card',
  'AADHAAR': 'Aadhaar Card',
  'SALARY_SLIP': 'Salary Slips (3M)',
  'BANK_STATEMENT': 'Bank Statement (6M)',
  'ITR': 'ITR (2 Yrs)'
};

export default function CustomerProfile({ customerId, onBack }: CustomerProfileProps) {
  const [customer, setCustomer] = useState<any>(null);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('DETAILS');

  // Activity and Consultation Logs States
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [activityType, setActivityType] = useState('CALL');
  const [activityNotes, setActivityNotes] = useState('');

  // Loan Health Overrides States
  const [metricIncome, setMetricIncome] = useState(0);
  const [metricCredit, setMetricCredit] = useState(0);
  const [metricEmi, setMetricEmi] = useState(0);
  const [metricDoc, setMetricDoc] = useState(0);
  const [savingMetrics, setSavingMetrics] = useState(false);

  useEffect(() => {
    fetchCustomerData();
  }, [customerId]);

  useEffect(() => {
    if (customer?.loan_health_metrics) {
      setMetricIncome(customer.loan_health_metrics.income_stability || 0);
      setMetricCredit(customer.loan_health_metrics.credit_behaviour || 0);
      setMetricEmi(customer.loan_health_metrics.emi_burden || 0);
      setMetricDoc(customer.loan_health_metrics.documentation || 0);
    }
  }, [customer]);

  const handleWhatsAppClick = (phoneNum: string) => {
    if (!phoneNum) return;
    const cleanPhone = phoneNum.replace(/[^0-9]/g, '');
    const fullPhone = cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone;
    const greeting = `Hello ${customer?.name || ''}, this is the advisory team from Click India Capital. I am following up on your loan inquiry. How can I assist you today?`;
    const encodedText = encodeURIComponent(greeting);
    window.open(`https://wa.me/${fullPhone}?text=${encodedText}`, '_blank');
  };

  const handleLogActivitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activityNotes) return;
    try {
      const { error } = await supabase
        .from('customer_timeline')
        .insert([{
          customer_id: customerId,
          event_type: activityType,
          description: activityNotes
        }]);

      if (error) throw error;
      
      setIsActivityModalOpen(false);
      setActivityNotes('');
      
      await fetchCustomerData();
    } catch (err: any) {
      console.error(err);
      alert('Failed to log activity: ' + err.message);
    }
  };

  const handleUpdateMetrics = async () => {
    setSavingMetrics(true);
    try {
      const updatedMetrics = {
        income_stability: metricIncome,
        credit_behaviour: metricCredit,
        emi_burden: metricEmi,
        documentation: metricDoc
      };

      const newScore = Math.round((metricIncome + metricCredit + metricEmi + metricDoc) * 2.5);

      const { error } = await supabase
        .from('customers')
        .update({
          loan_health_metrics: updatedMetrics,
          borrow_readiness_score: newScore
        })
        .eq('id', customerId);

      if (error) throw error;

      await supabase.from('customer_timeline').insert([{
        customer_id: customerId,
        event_type: 'METRICS_UPDATED',
        description: `Advisory readiness metrics manually updated. New Score: ${newScore}/100.`
      }]);

      alert('Metrics updated successfully!');
      await fetchCustomerData();
    } catch (err: any) {
      console.error(err);
      alert('Failed to update metrics: ' + err.message);
    } finally {
      setSavingMetrics(false);
    }
  };

  const fetchCustomerData = async () => {
    setLoading(true);
    try {
      const { data: cData } = await customerService.getCustomerById(customerId);
      const { data: tData } = await customerService.getTimeline(customerId);
      const { data: dData } = await customerService.getDocuments(customerId);
      
      setCustomer(cData);
      setTimeline(tData || []);
      setDocuments(dData || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToDNC = async () => {
    if (!customer) return;
    if (!confirm(`Are you sure you want to add ${customer.name} (${customer.phone}) to the global Do Not Contact (DNC) list?`)) {
      return;
    }

    try {
      // 1. Insert into do_not_contact
      const { error: dncError } = await supabase
        .from('do_not_contact')
        .insert([{ 
          phone: customer.phone, 
          reason: 'OPT_OUT', 
          source: 'CRM_MANUAL' 
        }]);

      if (dncError && dncError.code !== '23505') {
        throw dncError;
      }

      // 2. Update all active leads for this customer to REJECTED
      const { error: leadsError } = await supabase
        .from('leads')
        .update({ status: 'REJECTED' })
        .eq('customer_id', customerId);

      if (leadsError) throw leadsError;

      // 3. Write event to customer_timeline
      const { error: timelineError } = await supabase
        .from('customer_timeline')
        .insert([{
          customer_id: customerId,
          event_type: 'OPTED_OUT',
          description: 'Customer requested to STOP outreach. Phone added to global DNC blocklist by Advisor.'
        }]);

      if (timelineError) throw timelineError;

      alert(`${customer.name} has been added to the Do Not Contact blocklist.`);
      await fetchCustomerData();
    } catch (err: any) {
      console.error('Failed to add to DNC:', err);
      alert('Failed to add to DNC: ' + err.message);
    }
  };

  const handleUpdateDocStatus = async (docId: string, newStatus: string, docType: string) => {
    try {
      const { error } = await supabase
        .from('customer_documents')
        .update({ status: newStatus })
        .eq('id', docId);

      if (error) throw error;

      // Add timeline event
      await supabase.from('customer_timeline').insert([{
        customer_id: customerId,
        event_type: `DOCUMENT_${newStatus}`,
        description: `${docLabels[docType] || docType} was marked as ${newStatus.toLowerCase()} by Administrator.`
      }]);

      // Refresh data
      await fetchCustomerData();
    } catch (e: any) {
      console.error('Failed to update document status:', e);
      alert('Failed to update status: ' + e.message);
    }
  };

  const handleViewDocument = async (fileUrl: string) => {
    try {
      const { data, error } = await supabase
        .storage
        .from('customer-documents')
        .createSignedUrl(fileUrl, 60);

      if (error) throw error;
      if (data?.signedUrl) {
        window.open(data.signedUrl, '_blank');
      }
    } catch (e: any) {
      console.error('Failed to generate signed URL:', e);
      alert('Failed to view file: ' + e.message);
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
                <div className="flex items-center gap-1.5">
                  <p className="text-slate-500 font-medium">{customer.phone}</p>
                  <button
                    onClick={() => handleWhatsAppClick(customer.phone)}
                    className="p-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-600 rounded-full transition-colors flex items-center justify-center"
                    title="Chat on WhatsApp"
                  >
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.73-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.965C16.588 1.977 14.12 .953 11.5 .953c-5.44 0-9.866 4.372-9.87 9.802 0 1.714.46 3.393 1.332 4.888L1.93 21.056l4.717-1.229c.001-.001.002-.001.002-.001zm11.758-6.72c-.3-.149-1.774-.863-2.046-.961-.273-.099-.472-.149-.669.149-.198.299-.766.961-.94 1.159-.173.199-.348.223-.648.075-.3-.15-1.266-.46-2.41-1.472-.89-.785-1.49-1.755-1.665-2.053-.173-.297-.018-.458.13-.606.134-.133.3-.347.45-.52.149-.172.2-.297.3-.495.099-.198.05-.371-.025-.52-.075-.149-.669-1.587-.916-2.182-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.774-.719 2.022-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347z"/>
                    </svg>
                  </button>
                </div>
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
          
          <div className="text-right flex flex-col items-end gap-3">
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Borrow Readiness</p>
              <div className="flex items-center gap-3 justify-end">
                <div className="text-3xl font-black text-slate-900">
                  {customer.borrow_readiness_score || '--'}<span className="text-lg text-slate-400">/100</span>
                </div>
                <div className={`w-3 h-3 rounded-full ${
                  (customer.borrow_readiness_score || 0) >= 80 ? 'bg-emerald-500' :
                  (customer.borrow_readiness_score || 0) >= 50 ? 'bg-orange-500' : 'bg-red-500'
                }`} />
              </div>
            </div>
            <button
              onClick={handleAddToDNC}
              className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-650 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border border-red-200 shadow-sm cursor-pointer"
              title="Add customer to global Do Not Contact (DNC) list"
            >
              <Shield size={14} /> Add to Blocklist
            </button>
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
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <p className="font-medium text-slate-800">{customer.whatsapp || customer.phone}</p>
                      <button
                        onClick={() => handleWhatsAppClick(customer.whatsapp || customer.phone)}
                        className="p-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-600 rounded-full transition-colors flex items-center justify-center"
                        title="Chat on WhatsApp"
                      >
                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.73-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.965C16.588 1.977 14.12 .953 11.5 .953c-5.44 0-9.866 4.372-9.87 9.802 0 1.714.46 3.393 1.332 4.888L1.93 21.056l4.717-1.229c.001-.001.002-.001.002-.001zm11.758-6.72c-.3-.149-1.774-.863-2.046-.961-.273-.099-.472-.149-.669.149-.198.299-.766.961-.94 1.159-.173.199-.348.223-.648.075-.3-.15-1.266-.46-2.41-1.472-.89-.785-1.49-1.755-1.665-2.053-.173-.297-.018-.458.13-.606.134-.133.3-.347.45-.52.149-.172.2-.297.3-.495.099-.198.05-.371-.025-.52-.075-.149-.669-1.587-.916-2.182-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.774-.719 2.022-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347z"/>
                        </svg>
                      </button>
                    </div>
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
              <div className="flex justify-between items-center mb-8">
                <h3 className="font-black text-lg uppercase tracking-tighter">Chronological History</h3>
                <button 
                  onClick={() => setIsActivityModalOpen(true)}
                  className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm transition-colors cursor-pointer"
                >
                  <Plus size={14} /> Log Activity
                </button>
              </div>
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
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
                 <div>
                   <h3 className="font-black text-xl mb-6">Financial Fitness Radar</h3>
                   <div className="space-y-6">
                      {[
                        { label: 'Income Stability', val: metricIncome, setVal: setMetricIncome, color: 'blue' },
                        { label: 'Credit Behaviour', val: metricCredit, setVal: setMetricCredit, color: 'purple' },
                        { label: 'EMI Burden', val: metricEmi, setVal: setMetricEmi, color: 'orange' },
                        { label: 'Documentation Readiness', val: metricDoc, setVal: setMetricDoc, color: 'emerald' },
                      ].map(metric => (
                        <div key={metric.label} className="space-y-2">
                          <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-slate-500">
                            <span>{metric.label}</span>
                            <span className="text-slate-900 font-black">{metric.val}/10</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <input 
                              type="range"
                              min="0"
                              max="10"
                              value={metric.val}
                              onChange={(e) => metric.setVal(parseInt(e.target.value))}
                              className="w-full cursor-pointer accent-blue-600"
                            />
                          </div>
                        </div>
                      ))}
                   </div>
                 </div>
                 
                 <button
                   onClick={handleUpdateMetrics}
                   disabled={savingMetrics}
                   className="w-full mt-8 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all shadow-md shadow-blue-100 flex items-center justify-center gap-2 cursor-pointer"
                 >
                   {savingMetrics ? (
                     <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                   ) : (
                     'Update Metrics & Score'
                   )}
                 </button>
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {['PAN', 'AADHAAR', 'SALARY_SLIP', 'BANK_STATEMENT', 'ITR'].map((docType) => {
                  const dbDoc = documents.find(d => d.document_type === docType);
                  return (
                    <div 
                      key={docType} 
                      className={`border rounded-2xl p-5 flex flex-col justify-between gap-4 transition-all ${
                        dbDoc?.status === 'VERIFIED' ? 'border-emerald-200 bg-emerald-50/10' :
                        dbDoc?.status === 'REJECTED' ? 'border-red-200 bg-red-50/10' :
                        dbDoc ? 'border-blue-200 bg-blue-50/10' : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          dbDoc?.status === 'VERIFIED' ? 'bg-emerald-100 text-emerald-600' :
                          dbDoc?.status === 'REJECTED' ? 'bg-red-100 text-red-600' :
                          dbDoc ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'
                        }`}>
                          <FileText size={20} />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-slate-900">{docLabels[docType]}</h4>
                          <div className="mt-1 flex flex-col gap-1 text-[10px] text-slate-500 uppercase tracking-wider font-bold">
                            {dbDoc ? (
                              <>
                                <span className={
                                  dbDoc.status === 'VERIFIED' ? 'text-emerald-600' :
                                  dbDoc.status === 'REJECTED' ? 'text-red-500' : 'text-blue-600'
                                }>
                                  Status: {dbDoc.status}
                                </span>
                                {dbDoc.uploaded_at && (
                                  <span className="text-slate-400 font-medium normal-case">
                                    Uploaded: {new Date(dbDoc.uploaded_at).toLocaleDateString()}
                                  </span>
                                )}
                              </>
                            ) : (
                              <span className="text-orange-500">Pending Upload</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {dbDoc && (
                        <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
                          <button 
                            onClick={() => handleViewDocument(dbDoc.file_url)}
                            className="w-full text-center bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm"
                          >
                            View / Download
                          </button>
                          <div className="flex gap-2">
                            {dbDoc.status !== 'VERIFIED' && (
                              <button 
                                onClick={() => handleUpdateDocStatus(dbDoc.id, 'VERIFIED', docType)}
                                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1"
                              >
                                <Check size={12} /> Verify
                              </button>
                            )}
                            {dbDoc.status !== 'REJECTED' && (
                              <button 
                                onClick={() => handleUpdateDocStatus(dbDoc.id, 'REJECTED', docType)}
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1"
                              >
                                <CloseIcon size={12} /> Reject
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
        </div>
      </div>
      
      {/* Log Activity Modal */}
      {isActivityModalOpen && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Log Consultation Activity</h3>
              <button 
                onClick={() => setIsActivityModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <CloseIcon size={20} />
              </button>
            </div>
            
            <form onSubmit={handleLogActivitySubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Activity Type</label>
                <select 
                  value={activityType} 
                  onChange={e => setActivityType(e.target.value)}
                  className="w-full p-3.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                >
                  <option value="CALL">📞 Phone Call</option>
                  <option value="FOLLOW_UP">🔄 Follow Up</option>
                  <option value="DOCS_COLLECTED">📂 Documents Collected</option>
                  <option value="MEETING">🤝 Consultation/Meeting</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Notes & Summary</label>
                <textarea 
                  rows={4}
                  value={activityNotes}
                  onChange={e => setActivityNotes(e.target.value)}
                  required
                  placeholder="Type a brief summary of the consultation or action taken..."
                  className="w-full p-3.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none font-medium placeholder:text-slate-400"
                />
              </div>
              
              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setIsActivityModalOpen(false)}
                  className="flex-1 border border-slate-200 text-slate-500 hover:bg-slate-50 py-3.5 rounded-xl font-bold text-sm transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-bold text-sm transition-all shadow-md shadow-blue-100"
                >
                  Save Activity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating AI Assistant */}
      <AIChatAssistant contextData={customer} />

    </div>
  );
}

// Dummy loader to fix unresolved import
const Loader2 = ({ className, size }: { className?: string, size?: number }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
);
