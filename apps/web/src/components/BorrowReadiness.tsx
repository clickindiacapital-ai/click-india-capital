import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, CheckCircle2, AlertTriangle, Calculator, ChevronRight } from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import { generateUUID } from '../utils/uuid';

export default function BorrowReadiness() {
  const { t } = useTranslation();
  
  const [step, setStep] = useState(1);
  const [isCalculating, setIsCalculating] = useState(false);
  const [scoreResult, setScoreResult] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    loanType: '',
    monthlyIncome: '',
    employment: '',
    existingEmi: '',
    creditScore: '',
    city: '',
    goal: '',
    worry: '',
    name: '',
    phone: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleNext = () => {
    if (step < 9) setStep(step + 1);
    else calculateScore();
  };

  const calculateScore = async () => {
    setIsCalculating(true);
    
    // Simulate calculation time
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const score = parseInt(formData.creditScore) || 0;
    const income = parseInt(formData.monthlyIncome) || 0;
    const emi = parseInt(formData.existingEmi) || 0;
    
    // Calculate Borrow Readiness Score (0-100)
    let totalScore = 50; // Base score
    if (score >= 750) totalScore += 25;
    else if (score >= 650) totalScore += 15;
    
    const foir = income > 0 ? (emi / income) : 1;
    if (foir <= 0.4) totalScore += 25;
    else if (foir <= 0.6) totalScore += 10;
    else totalScore -= 10;

    totalScore = Math.max(0, Math.min(100, totalScore));

    // Determine Approval Chances
    let chances = 'Low';
    let color = 'red';
    if (totalScore >= 80) { chances = 'High'; color = 'emerald'; }
    else if (totalScore >= 60) { chances = 'Moderate'; color = 'amber'; }

    // Risk Factors & Suggestions
    const risks = [];
    const suggestions = [];
    if (foir > 0.5) {
      risks.push("Existing EMI burden is high");
      suggestions.push("Reduce existing EMI obligations before applying");
    } else {
      suggestions.push("Income supports strong eligibility");
    }

    if (score < 700) {
      risks.push("Credit score needs improvement");
      suggestions.push("Focus on clearing outstanding credit card dues");
    }

    if (formData.employment === 'SelfEmployed') {
      risks.push("Self-employed profiles require strict vintage proofs");
      suggestions.push("Ensure 2 years of solid ITR filings are ready");
    }

    const loanHealth = {
      income_stability: formData.employment === 'Salaried' ? 9 : 7,
      credit_behaviour: score >= 750 ? 9 : score >= 650 ? 7 : 4,
      emi_burden: foir <= 0.4 ? 9 : foir <= 0.6 ? 6 : 3,
      documentation: 8
    };

    // Evaluate Credit Policy Engine Rules
    let matchedLenders: any[] = [];
    try {
      const { data: policies, error } = await supabase
        .from('lender_policies')
        .select('*')
        .eq('active', true);
      
      if (policies && !error) {
        const userFoirPct = foir * 100;
        let userLoanType = 'Personal Loan';
        if (formData.loanType === 'Business') userLoanType = 'Business Loan';
        else if (formData.loanType === 'Home') userLoanType = 'Home Loan';
        else if (formData.loanType === 'Vehicle') userLoanType = 'Vehicle Loan';

        const normalizedEmployment = formData.employment === 'SelfEmployed' ? 'Self-Employed' : formData.employment;

        matchedLenders = policies.map((policy: any) => {
          const cibilOk = score >= policy.min_cibil;
          const incomeOk = income >= policy.min_income;
          const foirOk = userFoirPct <= policy.max_foir_percentage;
          const employmentOk = policy.allowed_employment_types.includes(normalizedEmployment);
          const loanOk = policy.allowed_loan_types.includes(userLoanType);

          const passedChecks = [cibilOk, incomeOk, foirOk, employmentOk, loanOk].filter(Boolean).length;
          
          let matchStatus = 'Low Match';
          let matchColor = 'red';
          if (passedChecks === 5) {
            matchStatus = 'High Match';
            matchColor = 'emerald';
          } else if (passedChecks >= 3) {
            matchStatus = 'Moderate Match';
            matchColor = 'amber';
          }

          return {
            bank_name: policy.bank_name,
            base_rate: policy.base_interest_rate,
            status: matchStatus,
            color: matchColor,
            notes: policy.notes,
            cibilOk,
            incomeOk,
            foirOk,
            employmentOk,
            loanOk
          };
        });

        const matchOrder: Record<string, number> = { 'High Match': 1, 'Moderate Match': 2, 'Low Match': 3 };
        matchedLenders.sort((a, b) => matchOrder[a.status] - matchOrder[b.status]);
      }
    } catch (err) {
      console.error('Failed to query Credit Policy Rule Engine:', err);
    }

    const resultObj = { totalScore, chances, color, risks, suggestions, loanHealth, matchedLenders };
    setScoreResult(resultObj);
    setIsCalculating(false);

    // Save to CRM (Supabase)
    try {
      if (formData.name && formData.phone) {
        const customerId = generateUUID();

        // Create Customer
        const { error: customerError } = await supabase.from('customers').insert([{
          id: customerId,
          name: formData.name,
          phone: formData.phone,
          city: formData.city,
          employment_type: formData.employment,
          monthly_income: income,
          emi_obligations: emi,
          credit_score: score,
          primary_goal: formData.goal,
          borrow_readiness_score: totalScore,
          loan_health_metrics: loanHealth,
          tags: [formData.worry]
        }]);

        if (!customerError) {
          // Create Lead
          await supabase.from('leads').insert([{
            customer_id: customerId,
            name: formData.name,
            phone: formData.phone,
            loan_type: formData.loanType,
            status: 'NEW',
            source: 'Borrow Readiness Check',
            urgent_action_required: false
          }]);
        } else {
          console.error('Customer insert error:', customerError);
        }
      }
    } catch (err) {
      console.error('Failed to save to CRM', err);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden max-w-3xl mx-auto">
      <div className="bg-slate-900 p-8 text-center text-white">
        <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/20">
          <Calculator className="w-6 h-6 text-emerald-400" />
        </div>
        <h3 className="text-3xl font-black mb-2 uppercase tracking-tight">Borrow Readiness Check</h3>
        <p className="text-slate-400 font-medium">Discover your financial health score and approval chances instantly.</p>
      </div>
      
      <div className="p-8">
        {!scoreResult && !isCalculating && (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-8">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Step {step} of 9</span>
              <div className="flex gap-1">
                {[1,2,3,4,5,6,7,8,9].map(i => (
                  <div key={i} className={`h-1.5 w-4 rounded-full ${i <= step ? 'bg-blue-600' : 'bg-slate-100'}`} />
                ))}
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-4 min-h-[120px]"
              >
                {step === 1 && (
                  <div>
                    <label className="block text-xl font-bold text-slate-900 mb-4">{t('home.readiness.loanType')}</label>
                    <select name="loanType" value={formData.loanType} onChange={handleChange} className="w-full p-4 rounded-2xl border-2 border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-medium transition-all">
                      <option value="">Select Option</option>
                      <option value="Personal">Personal Loan</option>
                      <option value="Business">Business Loan</option>
                      <option value="Home">Home Loan</option>
                      <option value="Vehicle">Vehicle Loan</option>
                    </select>
                  </div>
                )}
                {step === 2 && (
                  <div>
                    <label className="block text-xl font-bold text-slate-900 mb-4">What are you hoping to achieve?</label>
                    <select name="goal" value={formData.goal} onChange={handleChange} className="w-full p-4 rounded-2xl border-2 border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-medium transition-all">
                      <option value="">Select Goal</option>
                      <option value="Buy a Vehicle">🚗 Buy a Vehicle</option>
                      <option value="Buy a Home">🏠 Buy a Home</option>
                      <option value="Grow Business">💼 Grow Business</option>
                      <option value="Debt Consolidation">💳 Debt Consolidation</option>
                      <option value="Loan Rejection Help">📄 Loan Rejection Help</option>
                      <option value="Just Exploring">❓ Just Exploring</option>
                    </select>
                  </div>
                )}
                {step === 3 && (
                  <div>
                    <label className="block text-xl font-bold text-slate-900 mb-4">What worries you most about taking a loan?</label>
                    <select name="worry" value={formData.worry} onChange={handleChange} className="w-full p-4 rounded-2xl border-2 border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-medium transition-all">
                      <option value="">Select Concern</option>
                      <option value="Fear of rejection">Fear of rejection</option>
                      <option value="High EMI">High EMI</option>
                      <option value="Low Credit Score">Low Credit Score</option>
                      <option value="Documentation">Documentation requirements</option>
                      <option value="Hidden Charges">Hidden Charges</option>
                      <option value="Unsure which loan to choose">Unsure which loan to choose</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                )}
                {step === 4 && (
                  <div>
                    <label className="block text-xl font-bold text-slate-900 mb-4">{t('home.readiness.employment')}</label>
                    <select name="employment" value={formData.employment} onChange={handleChange} className="w-full p-4 rounded-2xl border-2 border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-medium transition-all">
                      <option value="">Select Option</option>
                      <option value="Salaried">Salaried</option>
                      <option value="SelfEmployed">Self Employed</option>
                    </select>
                  </div>
                )}
                {step === 5 && (
                  <div>
                    <label className="block text-xl font-bold text-slate-900 mb-4">{t('home.readiness.monthlyIncome')}</label>
                    <input type="number" name="monthlyIncome" value={formData.monthlyIncome} onChange={handleChange} placeholder="e.g. 50000" className="w-full p-4 rounded-2xl border-2 border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-medium transition-all" />
                  </div>
                )}
                {step === 6 && (
                  <div>
                    <label className="block text-xl font-bold text-slate-900 mb-4">{t('home.readiness.existingEmi')}</label>
                    <input type="number" name="existingEmi" value={formData.existingEmi} onChange={handleChange} placeholder="e.g. 15000" className="w-full p-4 rounded-2xl border-2 border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-medium transition-all" />
                  </div>
                )}
                {step === 7 && (
                  <div>
                    <label className="block text-xl font-bold text-slate-900 mb-4">{t('home.readiness.creditScore')}</label>
                    <select name="creditScore" value={formData.creditScore} onChange={handleChange} className="w-full p-4 rounded-2xl border-2 border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-medium transition-all">
                      <option value="">Select Option</option>
                      <option value="750">Excellent (750+)</option>
                      <option value="650">Good (650 - 749)</option>
                      <option value="550">Average (550 - 649)</option>
                      <option value="0">Low/No History</option>
                    </select>
                  </div>
                )}
                {step === 8 && (
                  <div>
                    <label className="block text-xl font-bold text-slate-900 mb-4">Your Name</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Enter full name" className="w-full p-4 rounded-2xl border-2 border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-medium transition-all" />
                  </div>
                )}
                {step === 9 && (
                  <div>
                    <label className="block text-xl font-bold text-slate-900 mb-4">Phone Number</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="Enter 10-digit number" className="w-full p-4 rounded-2xl border-2 border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-medium transition-all" />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            <button
              onClick={handleNext}
              disabled={
                (step === 1 && !formData.loanType) ||
                (step === 2 && !formData.goal) ||
                (step === 3 && !formData.worry) ||
                (step === 4 && !formData.employment) ||
                (step === 5 && !formData.monthlyIncome) ||
                (step === 6 && !formData.existingEmi) ||
                (step === 7 && !formData.creditScore) ||
                (step === 8 && !formData.name) ||
                (step === 9 && !formData.phone)
              }
              className="w-full py-5 mt-8 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-black uppercase tracking-widest rounded-2xl transition-all flex justify-center items-center gap-2 shadow-lg shadow-blue-600/20"
            >
              {step === 9 ? 'Calculate Readiness Score' : 'Continue'}
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {isCalculating && (
          <div className="py-20 text-center">
            <div className="w-20 h-20 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-8"></div>
            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Analyzing Profile</h3>
            <p className="text-slate-500 font-medium mt-2">Checking lender policies & risk matrices...</p>
          </div>
        )}

        {scoreResult && !isCalculating && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-left"
          >
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 pb-8 border-b border-slate-100 gap-6">
               <div>
                  <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Readiness Profile</h3>
                  <div className="flex items-center gap-3 mt-2">
                     <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Approval Chances:</span>
                     <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-${scoreResult.color}-100 text-${scoreResult.color}-700`}>
                       {scoreResult.chances}
                     </span>
                  </div>
               </div>
               <div className="text-right bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Borrow Readiness Score</p>
                  <div className="text-4xl font-black text-slate-900">
                    {scoreResult.totalScore}<span className="text-xl text-slate-400">/100</span>
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
               {/* Risk Factors */}
               <div className="bg-red-50 p-6 rounded-3xl border border-red-100">
                  <h4 className="font-black text-red-900 mb-4 uppercase tracking-tight flex items-center gap-2">
                    <AlertTriangle size={18} className="text-red-500" />
                    Risk Factors
                  </h4>
                  <ul className="space-y-3">
                    {scoreResult.risks.length > 0 ? scoreResult.risks.map((risk: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-red-800 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
                        {risk}
                      </li>
                    )) : (
                      <li className="text-sm text-emerald-700 font-bold">No major risk factors detected!</li>
                    )}
                  </ul>
               </div>

               {/* Suggestions */}
               <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100">
                  <h4 className="font-black text-blue-900 mb-4 uppercase tracking-tight flex items-center gap-2">
                    <CheckCircle2 size={18} className="text-blue-500" />
                    Expert Suggestions
                  </h4>
                  <ul className="space-y-3">
                    {scoreResult.suggestions.map((suggestion: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-blue-800 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                        {suggestion}
                      </li>
                    ))}
                  </ul>
               </div>
            </div>

            {/* Tentative Lender Matches via Credit Policy Rule Engine */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 mb-8">
               <h4 className="font-black text-xl text-slate-900 mb-2 uppercase tracking-tighter">Tentative Lender Matches</h4>
               <p className="text-slate-500 text-xs mb-6">Based on active bank credit policies and interest rates in our system.</p>
               
               <div className="space-y-4">
                 {scoreResult.matchedLenders && scoreResult.matchedLenders.length > 0 ? (
                   scoreResult.matchedLenders.map((match: any, i: number) => (
                     <div key={i} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 bg-slate-50 rounded-2xl border border-slate-100 gap-4 transition-all hover:border-slate-200">
                       <div className="space-y-1">
                         <div className="flex items-center gap-2.5">
                           <span className="font-bold text-slate-900 text-base">{match.bank_name}</span>
                           <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                             match.color === 'emerald' ? 'bg-emerald-100 text-emerald-700' : match.color === 'amber' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                           }`}>
                             {match.status}
                           </span>
                         </div>
                         <p className="text-xs text-slate-400 max-w-md">{match.notes || 'Meets guidelines requirements.'}</p>
                         
                         {/* Checks breakdown */}
                         <div className="flex flex-wrap gap-x-3 gap-y-1 pt-2 text-[10px] font-bold text-slate-400">
                           <span className={match.cibilOk ? 'text-emerald-600' : 'text-red-500'}>
                             {match.cibilOk ? '✓' : '✗'} CIBIL
                           </span>
                           <span className={match.incomeOk ? 'text-emerald-600' : 'text-red-500'}>
                             {match.incomeOk ? '✓' : '✗'} Income
                           </span>
                           <span className={match.foirOk ? 'text-emerald-600' : 'text-red-500'}>
                             {match.foirOk ? '✓' : '✗'} FOIR
                           </span>
                           <span className={match.employmentOk ? 'text-emerald-600' : 'text-red-500'}>
                             {match.employmentOk ? '✓' : '✗'} Profile
                           </span>
                         </div>
                       </div>
                       
                       <div className="text-left sm:text-right shrink-0">
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Base Rate</p>
                         <p className="text-xl font-black text-blue-600 mt-0.5">Starting @ {match.base_rate.toFixed(2)}%</p>
                       </div>
                     </div>
                   ))
                 ) : (
                   <p className="text-slate-400 text-sm py-4 text-center">No active policies configured in CRM engine.</p>
                 )}
               </div>
            </div>

            {/* Dynamic Documents Checklist */}
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 mb-8">
               <h4 className="font-black text-lg text-slate-900 mb-2 uppercase tracking-tight flex items-center gap-2">
                 📄 Required Documents Checklist
               </h4>
               <p className="text-slate-500 text-xs mb-4">Please prepare the following documents based on your {formData.employment === 'SelfEmployed' ? 'Self-Employed' : 'Salaried'} profile to proceed.</p>
               
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-700">
                 {formData.employment === 'SelfEmployed' ? (
                   <>
                     <div className="flex items-center gap-2.5 bg-white p-3.5 rounded-xl border border-slate-100">
                       <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4" defaultChecked />
                       <span>PAN Card & Aadhaar Card</span>
                     </div>
                     <div className="flex items-center gap-2.5 bg-white p-3.5 rounded-xl border border-slate-100">
                       <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4" />
                       <span>ITR Returns (Last 2 Years)</span>
                     </div>
                     <div className="flex items-center gap-2.5 bg-white p-3.5 rounded-xl border border-slate-100">
                       <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4" />
                       <span>GST Certificate & Business Proof</span>
                     </div>
                     <div className="flex items-center gap-2.5 bg-white p-3.5 rounded-xl border border-slate-100">
                       <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4" />
                       <span>Bank Statements (Last 12 Months)</span>
                     </div>
                   </>
                 ) : (
                   <>
                     <div className="flex items-center gap-2.5 bg-white p-3.5 rounded-xl border border-slate-100">
                       <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4" defaultChecked />
                       <span>PAN Card & Aadhaar Card</span>
                     </div>
                     <div className="flex items-center gap-2.5 bg-white p-3.5 rounded-xl border border-slate-100">
                       <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4" />
                       <span>Salary Slips (Last 3 Months)</span>
                     </div>
                     <div className="flex items-center gap-2.5 bg-white p-3.5 rounded-xl border border-slate-100">
                       <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4" />
                       <span>Form 16 / ITR Filings</span>
                     </div>
                     <div className="flex items-center gap-2.5 bg-white p-3.5 rounded-xl border border-slate-100">
                       <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4" />
                       <span>Bank Statements (Last 6 Months)</span>
                     </div>
                   </>
                 )}
               </div>
            </div>

            {/* Loan Health Score Matrix */}
            <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 mb-8 text-white">
               <h4 className="font-black text-xl mb-6 uppercase tracking-tighter">Loan Health Matrix</h4>
               <div className="space-y-5">
                  {[
                    { label: 'Income Stability', val: scoreResult.loanHealth.income_stability },
                    { label: 'Credit Behaviour', val: scoreResult.loanHealth.credit_behaviour },
                    { label: 'EMI Burden', val: scoreResult.loanHealth.emi_burden },
                    { label: 'Documentation', val: scoreResult.loanHealth.documentation },
                  ].map((metric, i) => (
                    <div key={i} className="space-y-2">
                       <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                         <span>{metric.label}</span>
                         <span className="text-white">{metric.val}/10</span>
                       </div>
                       <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                         <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(metric.val / 10) * 100}%` }} />
                       </div>
                    </div>
                  ))}
               </div>
            </div>

            <div className="space-y-4">
              <a href="#consulting" className="flex items-center justify-center gap-2 w-full py-5 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-emerald-600/20">
                Book Expert Consultation
                <ChevronRight className="w-5 h-5" />
              </a>
              <button onClick={() => { setStep(1); setScoreResult(null); setFormData(prev => ({...prev, name: '', phone: ''})) }} className="w-full text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-slate-800 transition-colors py-4">
                Recalculate Readiness
              </button>
            </div>
            
          </motion.div>
        )}
      </div>
    </div>
  );
}
