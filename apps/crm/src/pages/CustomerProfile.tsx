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
  
  // Matchmaking States
  const [matches, setMatches] = useState<any[]>([]);
  const [isCheckingEligibility, setIsCheckingEligibility] = useState(false);

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

  const handleWhatsAppClick = (phoneNum: string, customMessage?: string) => {
    if (!phoneNum) return;
    const cleanPhone = phoneNum.replace(/[^0-9]/g, '');
    const fullPhone = cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone;
    const defaultGreeting = `Hello ${customer?.name || ''}, this is the advisory team from Click India Capital. I am following up on your loan inquiry. How can I assist you today?`;
    const encodedText = encodeURIComponent(customMessage || defaultGreeting);
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
      const { data: cData } = await supabase.from('customers').select('*').eq('id', customerId).single();
      const { data: tData } = await supabase.from('customer_timeline').select('*').eq('customer_id', customerId).order('event_date', { ascending: false });
      const { data: mData } = await supabase.from('matches').select('*, lenders(*)').eq('customer_id', customerId).order('match_score', { ascending: false });
      
      setCustomer(cData);
      setTimeline(tData || []);
      setMatches(mData || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckEligibility = async () => {
    if (!customer) return;
    setIsCheckingEligibility(true);
    
    try {
      // Fetch all active lenders
      const { data: lenders } = await supabase.from('lenders').select('*').eq('active', true);
      if (!lenders) return;

      const newMatches = [];
      const cIncome = Number(customer.monthly_income) || 0;
      const cAge = Number(customer.age) || 30; // default if not set
      
      for (const lender of lenders) {
        // Basic hardcoded rule engine based on instructions
        let score = 100;
        if (cIncome < lender.min_income) {
           score -= 30; // Deduct if income below min
        } else if (cIncome > lender.min_income * 2) {
           score += 10;
        }

        if (cAge < lender.min_age || cAge > lender.max_age) {
           score -= 40;
        }

        if (lender.employment_type && !lender.employment_type.includes(customer.employment_type)) {
           score -= 50;
        }
        
        // Cap score
        score = Math.max(0, Math.min(100, score));

        newMatches.push({
          customer_id: customerId,
          lender_id: lender.id,
          match_score: score,
          eligibility_status: 'Tentative'
        });
      }

      // Save matches
      if (newMatches.length > 0) {
        await supabase.from('matches').delete().eq('customer_id', customerId); // clear old
        await supabase.from('matches').insert(newMatches);
        
        await supabase.from('customer_timeline').insert([{
          customer_id: customerId,
          event_type: 'ELIGIBILITY_CHECK',
          description: `Eligibility checked. Matched with ${newMatches.length} lenders.`
        }]);
        
        await supabase.from('customers').update({ lead_status: 'Eligibility Checked' }).eq('id', customerId);
      }

      await fetchCustomerData();
      setActiveTab('COMPARISON');
    } catch (error) {
      console.error("Failed to check eligibility:", error);
    } finally {
      setIsCheckingEligibility(false);
    }
  };

  const handleSelectLender = async (lenderId: string, lenderName: string) => {
    try {
      // Create comparison record
      await supabase.from('loan_comparisons').insert([{
        customer_id: customerId,
        compared_lenders: matches.map(m => m.lenders),
        selected_lender_id: lenderId,
        status: 'Selected'
      }]);

      await supabase.from('customer_timeline').insert([{
        customer_id: customerId,
        event_type: 'LENDER_SELECTED',
        description: `Customer selected ${lenderName} for forwarding.`
      }]);

      await supabase.from('customers').update({ lead_status: 'Forwarded' }).eq('id', customerId);

      alert(`Lead marked as forwarded to ${lenderName}!`);
      fetchCustomerData();
    } catch (e) {
      console.error("Failed to select lender:", e);
    }
  };

  const sendWhatsAppResults = () => {
    if (!customer || matches.length === 0) return;
    const topMatches = matches.filter(m => m.match_score >= 50).slice(0, 3);
    const msg = `Hi ${customer.name},

Based on your profile, you may be tentatively eligible with:
${topMatches.map(m => `• ${m.lenders?.lender_name} (Score: ${m.match_score}%)`).join('\n')}

This is only a tentative assessment and does not guarantee approval.
Reply YES if you would like assistance.`;
    handleWhatsAppClick(customer.phone, msg);
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
                {customer.lead_status && (
                  <span className="px-2.5 py-0.5 bg-purple-100 text-purple-700 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    Status: {customer.lead_status}
                  </span>
                )}
                <span className="px-2.5 py-0.5 bg-orange-100 text-orange-700 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  Temp: {customer.lead_temperature || 'Cold'}
                </span>
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
          {['DETAILS', 'TIMELINE', 'ELIGIBILITY', 'COMPARISON'].map(tab => (
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

          {activeTab === 'ELIGIBILITY' && (
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center">
                <Shield className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                <h3 className="font-black text-2xl text-slate-900 mb-2">Check Eligibility Match</h3>
                <p className="text-slate-500 mb-6 max-w-md mx-auto">
                  Run this customer's profile against our lender rules to find the best tentative matches.
                </p>
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm mb-6 text-left">
                  <strong>Disclaimer:</strong> This is a tentative eligibility assessment based on available data and does not guarantee approval. No documents are verified at this stage.
                </div>
                <button
                  onClick={handleCheckEligibility}
                  disabled={isCheckingEligibility}
                  className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold shadow-md hover:bg-blue-700 transition-colors disabled:opacity-50 inline-flex items-center gap-2"
                >
                  {isCheckingEligibility ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
                  {isCheckingEligibility ? 'Processing...' : 'Run Eligibility Check'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'COMPARISON' && (
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-center mb-8">
                <h3 className="font-black text-xl text-slate-900">Recommended Lenders</h3>
                <button 
                  onClick={sendWhatsAppResults}
                  className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors"
                >
                  <MessageSquare size={16} /> Send via WhatsApp
                </button>
              </div>

              {matches.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  No matches found. Please run the Eligibility Check first.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs font-bold uppercase tracking-wider">
                        <th className="p-4 rounded-tl-xl">Lender</th>
                        <th className="p-4">Match Score</th>
                        <th className="p-4">Interest Rate</th>
                        <th className="p-4">Processing Fee</th>
                        <th className="p-4">Est. Max Tenure</th>
                        <th className="p-4 rounded-tr-xl text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {matches.map((match) => (
                        <tr key={match.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-4 font-bold text-slate-900">
                            {match.lenders?.lender_name}
                          </td>
                          <td className="p-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                              match.match_score >= 80 ? 'bg-green-100 text-green-700' :
                              match.match_score >= 50 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {match.match_score}%
                            </span>
                          </td>
                          <td className="p-4 text-slate-700 font-medium">{match.lenders?.interest_rate}%</td>
                          <td className="p-4 text-slate-700 font-medium">{match.lenders?.processing_fee}%</td>
                          <td className="p-4 text-slate-700 font-medium">{match.lenders?.tenure_range}</td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => handleSelectLender(match.lender_id, match.lenders?.lender_name)}
                              className="bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white border border-blue-200 hover:border-transparent px-4 py-1.5 rounded-lg text-sm font-bold transition-all"
                            >
                              Select
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
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

