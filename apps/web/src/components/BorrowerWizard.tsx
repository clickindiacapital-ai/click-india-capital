import { useState, useEffect } from 'react';
import { 
  Car, User, Briefcase, Home, ShieldAlert, Sparkles, 
  ArrowLeft, ArrowRight, Loader2, CheckCircle2, ChevronRight, Lock
} from 'lucide-react';

export default function BorrowerWizard() {
  const [step, setStep] = useState(1);
  const [isMatching, setIsMatching] = useState(false);
  const [matchingStep, setMatchingStep] = useState(0);
  const [showResults, setShowResults] = useState(false);

  // Form States
  const [loanType, setLoanType] = useState('home');
  const [amount, setAmount] = useState(5000000); // 50 Lakhs
  const [tenure, setTenure] = useState('15'); // 15 years
  const [purpose, setPurpose] = useState('');
  const [employmentType, setEmploymentType] = useState('salaried');
  const [employerName, setEmployerName] = useState('');
  const [monthlySalary, setMonthlySalary] = useState(100000);
  const [workExperience, setWorkExperience] = useState('3');
  const [businessName, setBusinessName] = useState('');
  const [gstn, setGstn] = useState('');
  const [businessVintage, setBusinessVintage] = useState('3'); // 3 years
  const [entityType, setEntityType] = useState('Sole Proprietorship');
  const [monthlyTurnover, setMonthlyTurnover] = useState(300000); // 3 Lakhs
  const [propertyOwner, setPropertyOwner] = useState('no');
  const [creditScore, setCreditScore] = useState('excellent');
  const [existingEmi, setExistingEmi] = useState('0');
  
  // Contact States
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [pincode, setPincode] = useState('');
  
  // simulated radar statuses
  const matchingStatuses = [
    'Reading your borrow readiness profile...',
    'Analyzing credit behavior metrics...',
    'Calculating FOIR eligibility ratios...',
    'Matching profile against partner policies...',
    'Securing pre-approvals...'
  ];

  useEffect(() => {
    if (isMatching) {
      const interval = setInterval(() => {
        setMatchingStep((prev) => {
          if (prev >= matchingStatuses.length - 1) {
            clearInterval(interval);
            setIsMatching(false);
            setShowResults(true);
            return prev;
          }
          return prev + 1;
        });
      }, 1500);
      return () => clearInterval(interval);
    }
  }, [isMatching]);

  const handleNext = () => {
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setStep((prev) => prev - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsMatching(true);
    setMatchingStep(0);
  };

  // Purpose templates based on loan type
  const getPurposeOptions = () => {
    switch(loanType) {
      case 'home':
        return ['Ready to Move Flat', 'Under Construction Property', 'Plot Purchase & Construction', 'Home Renovation', 'Refinance/Balance Transfer'];
      case 'vehicle':
        return ['New Car Purchase', 'Used Car Finance', 'Two Wheeler Loan', 'Commercial Truck Purchase', 'Refinance/Loan Against Car'];
      case 'business':
        return ['Working Capital Expansion', 'Inventory/Raw Materials', 'Machinery & Equipment purchase', 'Business Premise Refurbishment', 'GST/Tax Dues Settlement'];
      default:
        return ['Debt Consolidation', 'Medical Emergencies', 'Family Wedding/Occasion', 'Higher Education Finance', 'Home Repair & Improvements'];
    }
  };

  if (isMatching) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden flex flex-col items-center justify-center min-h-[450px]">
        {/* Glowing visual matching radar */}
        <div className="relative w-36 h-36 flex items-center justify-center mb-8">
          <div className="absolute inset-0 rounded-full border border-blue-500/20 animate-ping" />
          <div className="absolute inset-4 rounded-full border border-indigo-500/30 animate-pulse" />
          <div className="absolute inset-8 rounded-full border border-emerald-500/20 animate-ping" style={{ animationDuration: '3s' }} />
          <div className="w-16 h-16 rounded-2xl bg-blue-600/10 border border-blue-500/40 flex items-center justify-center text-blue-400">
            <Loader2 className="animate-spin" size={24} />
          </div>
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Analyzing Partner Eligibility...</h3>
        <p className="text-slate-400 text-xs text-center max-w-sm mb-6">Evaluating your borrow readiness profile against lender risk frameworks.</p>
        
        {/* Dynamic status list */}
        <div className="w-full max-w-xs space-y-2.5">
          {matchingStatuses.map((status, index) => {
            const isCompleted = index < matchingStep;
            const isActive = index === matchingStep;
            return (
              <div 
                key={index} 
                className={`flex items-center gap-3 text-xs transition-opacity duration-300 ${isCompleted ? 'text-slate-400' : isActive ? 'text-blue-400 font-bold' : 'text-slate-700'}`}
              >
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center text-[8px] font-bold ${isCompleted ? 'border-emerald-500/50 bg-emerald-950/20 text-emerald-400' : isActive ? 'border-blue-500 bg-blue-950/20 text-blue-400 animate-pulse' : 'border-slate-800 text-slate-800'}`}>
                  {isCompleted ? '✓' : index + 1}
                </div>
                <span>{status}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden text-left space-y-6">
        <div className="absolute -top-16 -right-16 w-32 h-32 rounded-full bg-emerald-500/10 blur-xl pointer-events-none" />
        
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white leading-none">Eligibility Match Complete</h3>
            <p className="text-slate-500 text-xs mt-1">Based on Net income and FOIR thresholds</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.04] space-y-4">
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">Matched Financial Offers</h4>
          
          <div className="space-y-3">
            {/* Offer 1 */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950/40 border border-slate-800">
              <div className="space-y-1">
                <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/20 border border-emerald-500/10 px-2.5 py-0.5 rounded-full">High Match (98%)</span>
                <h5 className="font-bold text-sm text-white mt-1.5">Advisor Partner Option A</h5>
                <p className="text-[10px] text-slate-500">Indicative Rate: 8.75% p.a. | Zero pre-payment penalties</p>
              </div>
              <ChevronRight className="text-slate-600" size={16} />
            </div>

            {/* Offer 2 */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950/40 border border-slate-800">
              <div className="space-y-1">
                <span className="text-[9px] font-bold uppercase tracking-wider text-blue-400 bg-blue-950/20 border border-blue-500/10 px-2.5 py-0.5 rounded-full">Moderate Match (82%)</span>
                <h5 className="font-bold text-sm text-white mt-1.5">Advisor Partner Option B</h5>
                <p className="text-[10px] text-slate-500">Indicative Rate: 9.20% p.a. | Flexible processing options</p>
              </div>
              <ChevronRight className="text-slate-600" size={16} />
            </div>
          </div>
        </div>

        {/* Bank statement connect mock frame */}
        <div className="p-6 rounded-2xl bg-slate-950 border border-indigo-950/60 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-lg" />
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            ⚡ Fast-Track Advisory Diagnostics <span className="px-2 py-0.5 text-[8px] font-bold text-indigo-400 bg-indigo-950/40 border border-indigo-500/20 rounded">Optional</span>
          </h4>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            Securely link your bank statement transaction data using India's Account Aggregator structure to evaluate cashflows instantly and correct profile errors before bank submission.
          </p>
          <div className="mt-5 border border-dashed border-slate-800 rounded-xl p-8 text-center flex flex-col items-center justify-center gap-3">
            <Lock className="text-indigo-400" size={24} />
            <div>
              <p className="text-xs text-slate-300 font-bold">Account Aggregator Statement Link</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Read-Only, Secure, 256-bit Encrypted</p>
            </div>
            <button 
              type="button" 
              onClick={() => alert('Fast-track simulation initiated!')}
              className="mt-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold uppercase tracking-wider transition-colors"
            >
              Verify Cashflow via OTP
            </button>
          </div>
        </div>

        <button 
          onClick={() => {
            setShowResults(false);
            setStep(1);
          }}
          className="w-full py-3.5 bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
        >
          Check Another Loan Profile
        </button>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-[32px] p-8 md:p-10 shadow-2xl relative text-left">
      {/* Visual background flares */}
      <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-blue-500/5 blur-2xl pointer-events-none" />
      
      {/* Progress header */}
      <div className="flex items-center justify-between mb-8">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-wider">
          <Sparkles size={10} /> 2-Min Readiness Check
        </span>
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Step {step} of 8</span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* STEP 1: Loan Type */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="space-y-1">
              <h3 className="text-xl font-extrabold text-white">Select Loan Category</h3>
              <p className="text-slate-400 text-xs">Choose the product you need advice or matching for.</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-2">
              {[
                { id: 'home', label: 'Home Loan', icon: Home, desc: 'Purchase & Construction' },
                { id: 'personal', label: 'Personal Loan', icon: User, desc: 'Unsecured Credit Needs' },
                { id: 'vehicle', label: 'Vehicle Loan', icon: Car, desc: 'Auto & Commercial Transit' },
                { id: 'business', label: 'Business Loan', icon: Briefcase, desc: 'Working Capital & Growth' }
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = loanType === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setLoanType(item.id);
                      handleNext();
                    }}
                    className={`p-5 rounded-2xl border text-left flex flex-col justify-between h-32 transition-all ${isSelected ? 'bg-blue-600/10 border-blue-500 text-white shadow-lg shadow-blue-950/30' : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:bg-slate-900/40'}`}
                  >
                    <Icon size={22} className={isSelected ? 'text-blue-400' : 'text-slate-400'} />
                    <div>
                      <p className="font-bold text-sm text-white">{item.label}</p>
                      <p className="text-[9px] text-slate-500 mt-0.5 leading-none">{item.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 2: Amount & Tenure */}
        {step === 2 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="space-y-1">
              <h3 className="text-xl font-extrabold text-white">Amount & Tenure</h3>
              <p className="text-slate-400 text-xs">Provide a general estimate of your required loan.</p>
            </div>

            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-400">Funding Amount</span>
                  <span className="text-blue-400 text-sm font-black">₹{amount.toLocaleString('en-IN')}</span>
                </div>
                <input 
                  type="range"
                  min="50000"
                  max={loanType === 'home' ? 100000000 : 15000000}
                  step="50000"
                  value={amount}
                  onChange={(e) => setAmount(parseInt(e.target.value))}
                  className="w-full accent-blue-500 bg-slate-800 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-slate-500 font-bold uppercase">
                  <span>₹50K</span>
                  <span>{loanType === 'home' ? '₹10Cr' : '₹1.5Cr'}</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-400">Preferred Repayment Term</label>
                <select 
                  value={tenure}
                  onChange={(e) => setTenure(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white font-semibold focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  {loanType === 'home' ? (
                    <>
                      <option value="5">5 Years</option>
                      <option value="10">10 Years</option>
                      <option value="15">15 Years</option>
                      <option value="20">20 Years</option>
                      <option value="30">30 Years</option>
                    </>
                  ) : (
                    <>
                      <option value="1">1 Year</option>
                      <option value="2">2 Years</option>
                      <option value="3">3 Years</option>
                      <option value="5">5 Years</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={handleBack} className="px-5 py-3 border border-slate-800 hover:bg-slate-900 rounded-xl text-slate-400 text-xs font-bold flex items-center gap-1"><ArrowLeft size={14} /> Back</button>
              <button type="button" onClick={handleNext} className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1">Continue <ArrowRight size={14} /></button>
            </div>
          </div>
        )}

        {/* STEP 3: Purpose */}
        {step === 3 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="space-y-1">
              <h3 className="text-xl font-extrabold text-white">Reason for Funding</h3>
              <p className="text-slate-400 text-xs">Select what you plan to use the funds for.</p>
            </div>

            <div className="flex flex-wrap gap-2.5 pt-2">
              {getPurposeOptions().map((opt) => {
                const isSelected = purpose === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      setPurpose(opt);
                      handleNext();
                    }}
                    className={`px-4 py-2.5 rounded-full border text-xs font-semibold transition-all ${isSelected ? 'bg-blue-600/10 border-blue-500 text-blue-400 font-bold' : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            <div className="flex gap-3 pt-4">
              <button type="button" onClick={handleBack} className="px-5 py-3 border border-slate-800 hover:bg-slate-900 rounded-xl text-slate-400 text-xs font-bold flex items-center gap-1"><ArrowLeft size={14} /> Back</button>
            </div>
          </div>
        )}

        {/* STEP 4: Employment Type */}
        {step === 4 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="space-y-1">
              <h3 className="text-xl font-extrabold text-white">Employment Profile</h3>
              <p className="text-slate-400 text-xs">How do you primarily earn your income?</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-2">
              {[
                { id: 'salaried', label: 'Salaried', desc: 'I receive a fixed monthly salary', icon: User },
                { id: 'self-employed', label: 'Self-Employed', desc: 'I run my own business or practice', icon: Briefcase }
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = employmentType === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setEmploymentType(item.id);
                      handleNext();
                    }}
                    className={`p-5 rounded-2xl border text-left flex flex-col justify-between h-32 transition-all ${isSelected ? 'bg-blue-600/10 border-blue-500 text-white shadow-lg shadow-blue-950/30' : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:bg-slate-900/40'}`}
                  >
                    <Icon size={22} className={isSelected ? 'text-blue-400' : 'text-slate-400'} />
                    <div>
                      <p className="font-bold text-sm text-white">{item.label}</p>
                      <p className="text-[9px] text-slate-500 mt-0.5 leading-none">{item.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex gap-3 pt-4">
              <button type="button" onClick={handleBack} className="px-5 py-3 border border-slate-800 hover:bg-slate-900 rounded-xl text-slate-400 text-xs font-bold flex items-center gap-1"><ArrowLeft size={14} /> Back</button>
            </div>
          </div>
        )}

        {/* STEP 5: Verification (Business or Employer) */}
        {step === 5 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="space-y-1">
              <h3 className="text-xl font-extrabold text-white">Business Verification</h3>
              <p className="text-slate-400 text-xs">Verify your profile mapping using standard Indian tax numbers.</p>
            </div>

            <div className="space-y-4 pt-2">
              {employmentType === 'self-employed' ? (
                <>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-400">Company Name / Trade Name</label>
                    <input 
                      type="text" 
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="e.g. Acme Services"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 font-semibold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-400">GSTIN or Business PAN <span className="text-[10px] text-slate-600">(Optional)</span></label>
                    <input 
                      type="text" 
                      value={gstn}
                      onChange={(e) => setGstn(e.target.value.toUpperCase())}
                      placeholder="e.g. 27AAAAA0000A1Z"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 font-mono tracking-widest"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-400">Current Employer Name</label>
                    <input 
                      type="text" 
                      value={employerName}
                      onChange={(e) => setEmployerName(e.target.value)}
                      placeholder="e.g. TCS, Reliance, etc."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 font-semibold"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={handleBack} className="px-5 py-3 border border-slate-800 hover:bg-slate-900 rounded-xl text-slate-400 text-xs font-bold flex items-center gap-1"><ArrowLeft size={14} /> Back</button>
              <button type="button" onClick={handleNext} className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1">Continue <ArrowRight size={14} /></button>
            </div>
          </div>
        )}

        {/* STEP 6: Revenue/Salary Details */}
        {step === 6 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="space-y-1">
              <h3 className="text-xl font-extrabold text-white">Business History & Turnover</h3>
              <p className="text-slate-400 text-xs">Help us gauge credit criteria limits.</p>
            </div>

            <div className="space-y-4 pt-2">
              {employmentType === 'self-employed' ? (
                <>
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-400">Business Structure</label>
                    <div className="flex flex-wrap gap-2">
                      {['Sole Proprietorship', 'Partnership Firm', 'LLP / Pvt Ltd', 'Other'].map((type) => {
                        const isSelected = entityType === type;
                        return (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setEntityType(type)}
                            className={`px-4 py-2 rounded-xl border text-[10px] font-semibold transition-all ${isSelected ? 'bg-blue-600/10 border-blue-500 text-blue-400 font-bold' : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'}`}
                          >
                            {type}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-400">Business Vintage (Years)</label>
                    <select
                      value={businessVintage}
                      onChange={(e) => setBusinessVintage(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white font-semibold focus:outline-none focus:border-blue-500 cursor-pointer"
                    >
                      <option value="1">Less than 1 Year</option>
                      <option value="2">1 – 3 Years</option>
                      <option value="3">3 – 5 Years</option>
                      <option value="5">5+ Years</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-400">Avg Monthly Turnover</span>
                      <span className="text-blue-400">₹{monthlyTurnover.toLocaleString('en-IN')}</span>
                    </div>
                    <input 
                      type="range"
                      min="0"
                      max="2500000"
                      step="50000"
                      value={monthlyTurnover}
                      onChange={(e) => setMonthlyTurnover(parseInt(e.target.value))}
                      className="w-full accent-blue-500 bg-slate-800 rounded-lg cursor-pointer"
                    />
                    <div className="flex justify-between text-[8px] text-slate-500 font-bold uppercase">
                      <span>₹0</span>
                      <span>₹25L+</span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-400">Work Experience (Total Years)</label>
                    <select
                      value={workExperience}
                      onChange={(e) => setWorkExperience(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white font-semibold focus:outline-none focus:border-blue-500 cursor-pointer"
                    >
                      <option value="1">Less than 1 Year</option>
                      <option value="2">1 – 3 Years</option>
                      <option value="3">3 – 5 Years</option>
                      <option value="5">5+ Years</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-400">Net Monthly Salary</span>
                      <span className="text-blue-400">₹{monthlySalary.toLocaleString('en-IN')}</span>
                    </div>
                    <input 
                      type="range"
                      min="10000"
                      max="500000"
                      step="5000"
                      value={monthlySalary}
                      onChange={(e) => setMonthlySalary(parseInt(e.target.value))}
                      className="w-full accent-blue-500 bg-slate-800 rounded-lg cursor-pointer"
                    />
                    <div className="flex justify-between text-[8px] text-slate-500 font-bold uppercase">
                      <span>₹10K</span>
                      <span>₹5L+</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={handleBack} className="px-5 py-3 border border-slate-800 hover:bg-slate-900 rounded-xl text-slate-400 text-xs font-bold flex items-center gap-1"><ArrowLeft size={14} /> Back</button>
              <button type="button" onClick={handleNext} className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1">Continue <ArrowRight size={14} /></button>
            </div>
          </div>
        )}

        {/* STEP 7: Property & Credit */}
        {step === 7 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="space-y-1">
              <h3 className="text-xl font-extrabold text-white">Credit & Asset Profiles</h3>
              <p className="text-slate-400 text-xs">Self-disclosed stats that refine partner matching.</p>
            </div>

            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-400">Do you own residential or commercial property?</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'no', label: 'No' },
                    { id: 'res', label: 'Residential' },
                    { id: 'comm', label: 'Commercial' }
                  ].map((p) => {
                    const isSelected = propertyOwner === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setPropertyOwner(p.id)}
                        className={`py-2 px-3 rounded-xl border text-[10px] font-semibold text-center transition-all ${isSelected ? 'bg-blue-600/10 border-blue-500 text-blue-400 font-bold' : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'}`}
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-400">Estimated Credit Profile / CIBIL Range</label>
                <select
                  value={creditScore}
                  onChange={(e) => setCreditScore(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white font-semibold focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="excellent">Excellent (CIBIL 750+)</option>
                  <option value="good">Good (CIBIL 700 - 750)</option>
                  <option value="fair">Fair (CIBIL 650 - 700)</option>
                  <option value="bad">Issues (CIBIL &lt; 650 / Has Defaults)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-400">Existing Monthly EMI Outflow <span className="text-[10px] text-slate-600">(₹)</span></label>
                <input 
                  type="number" 
                  value={existingEmi}
                  onChange={(e) => setExistingEmi(e.target.value)}
                  placeholder="e.g. 15000"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 font-semibold"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={handleBack} className="px-5 py-3 border border-slate-800 hover:bg-slate-900 rounded-xl text-slate-400 text-xs font-bold flex items-center gap-1"><ArrowLeft size={14} /> Back</button>
              <button type="button" onClick={handleNext} className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1">Continue <ArrowRight size={14} /></button>
            </div>
          </div>
        )}

        {/* STEP 8: Contact details */}
        {step === 8 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="space-y-1">
              <h3 className="text-xl font-extrabold text-white">Receive Your matched Offers</h3>
              <p className="text-slate-400 text-xs">No hard CIBIL inquiries. Our credit team will verify your eligibility.</p>
            </div>

            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">First Name</label>
                  <input 
                    type="text" 
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Jane"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Last Name</label>
                  <input 
                    type="text" 
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Smith"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane@business.in"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mobile Number</label>
                  <input 
                    type="tel" 
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="98765 43210"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 font-semibold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">PIN Code</label>
                  <input 
                    type="text" 
                    required
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="400001"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 font-semibold"
                  />
                </div>
              </div>

              <p className="text-[9px] text-slate-500 leading-normal pt-2">
                By clicking "Get My Matches", you agree to our Terms and authorize Click India Capital advisors to check your loan eligibility. No hard credit score pull is performed at this stage.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={handleBack} className="px-5 py-3 border border-slate-800 hover:bg-slate-900 rounded-xl text-slate-400 text-xs font-bold flex items-center gap-1"><ArrowLeft size={14} /> Back</button>
              <button type="submit" className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-blue-900/30">
                <span>Get My Matches</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
