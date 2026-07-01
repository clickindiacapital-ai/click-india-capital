import { motion } from 'framer-motion';
import { 
  ArrowRight, ShieldCheck, Zap, Car, Briefcase, UserCircle, 
  Home as HomeIcon, CheckCircle2, Calculator, Sparkles, HelpCircle, FileSearch, Target
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import BorrowerWizard from '../components/BorrowerWizard';
import MarqueeTrack from '../components/MarqueeTrack';

export default function HomeV2() {
  const { t } = useTranslation();
  
  // Repayment Calculator states
  const [calcAmt, setCalcAmt] = useState(1500000); // 15 Lakhs
  const [calcRate, setCalcRate] = useState(9.5); // 9.5%
  const [calcTerm, setCalcTerm] = useState(15); // 15 years

  // EMI Math
  const calculateEmi = () => {
    const principal = calcAmt;
    const monthlyRate = calcRate / 12 / 100;
    const months = calcTerm * 12;
    if (monthlyRate === 0) return principal / months;
    
    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
    return Math.round(emi);
  };

  const emi = calculateEmi();
  const totalRepaid = emi * calcTerm * 12;
  const totalInterest = totalRepaid - calcAmt;

  const taglines = [
    "Indicative Match in 2 Minutes",
    "No CIBIL Score Impact",
    "Doorstep Advisory Services",
    "Combined 25+ Years Experience",
    "Secure Digital Vault"
  ];

  return (
    <div className="bg-[#030712] text-slate-100 min-h-screen relative overflow-hidden">
      {/* Visual background glows */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Hero Section */}
      <section className="relative pt-10 pb-20 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Copy Hooks */}
            <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider">
                <Sparkles size={12} /> Smart Loan advisory Platform
              </span>
              
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
                Finance matched,<br />
                <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400 bg-clip-text text-transparent">
                  eligibility verified.
                </span>
              </h1>
              
              <p className="text-slate-400 text-base md:text-lg leading-relaxed max-w-xl mx-auto lg:mx-0">
                Compare indicative lending thresholds across premium retail options in minutes. Get structured financial diagnostics and action plans to fix profile gaps before bank submission.
              </p>

              <div className="flex items-center justify-center lg:justify-start gap-3">
                <div className="flex -space-x-2.5">
                  <div className="w-8 h-8 rounded-full bg-blue-600 border border-slate-900 flex items-center justify-center text-[10px] font-bold text-white">CIC</div>
                  <div className="w-8 h-8 rounded-full bg-emerald-600 border border-slate-900 flex items-center justify-center text-[10px] font-bold text-white">AD</div>
                  <div className="w-8 h-8 rounded-full bg-indigo-600 border border-slate-900 flex items-center justify-center text-[10px] font-bold text-white">VA</div>
                </div>
                <span className="text-xs font-bold text-slate-400">Trusted expert advisor matching</span>
              </div>
            </div>

            {/* Right Column: Borrower Match Wizard */}
            <div className="lg:col-span-6 w-full max-w-lg mx-auto">
              <BorrowerWizard />
            </div>

          </div>
        </div>
      </section>

      {/* Infinite Tagline Marquee */}
      <MarqueeTrack items={taglines} />

      {/* Bento Grid Features Section */}
      <section className="py-24 border-t border-slate-900 bg-slate-950/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white">Reimagined Lending Diagnostics</h2>
            <p className="text-slate-400 text-sm md:text-base">We prioritize speed, security, and profile alignment over banking paperwork.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Bento Card 1 */}
            <div className="md:col-span-2 p-8 rounded-3xl bg-white/[0.01] border border-white/[0.04] flex flex-col justify-between hover:border-slate-800 transition-all relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors" />
              <div>
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-6">
                  <Zap size={22} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Indicative Approval Diagnostics</h3>
                <p className="text-slate-400 text-sm">
                  Evaluate your eligibility index against 20+ NBFC and Bank frameworks before doing hard CIBIL inquiries. Avoid standard rejections due to high FOIR or unoptimized credit mix.
                </p>
              </div>
              <div className="flex gap-6 mt-8">
                <div>
                  <div className="text-xl font-extrabold text-white">2 Min</div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">Eligibility assessment</div>
                </div>
                <div className="w-px bg-slate-800" />
                <div>
                  <div className="text-xl font-extrabold text-white">100%</div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">CIBIL Protection</div>
                </div>
              </div>
            </div>

            {/* Bento Card 2 */}
            <div className="p-8 rounded-3xl bg-white/[0.01] border border-white/[0.04] flex flex-col justify-between hover:border-slate-800 transition-all group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-6">
                  <ShieldCheck size={22} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Data Protection Vault</h3>
                <p className="text-slate-400 text-sm">
                  Your files are secure. Enjoy bank-grade document vaults and structured privacy filters on all applications.
                </p>
              </div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-6">Encrypted Vault</span>
            </div>

            {/* Bento Card 3 */}
            <div className="p-8 rounded-3xl bg-white/[0.01] border border-white/[0.04] flex flex-col justify-between hover:border-slate-800 transition-all group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-6">
                  <UserCircle size={22} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Expert Team Support</h3>
                <p className="text-slate-400 text-sm">
                  Our credit advisory lead coordinates directly with underwriters to clear bottlenecks. No call centers, just real advisors.
                </p>
              </div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-6">Dedicated Experts</span>
            </div>

            {/* Bento Card 4 */}
            <div className="md:col-span-2 p-8 rounded-3xl bg-white/[0.01] border border-white/[0.04] flex flex-col justify-between hover:border-slate-800 transition-all group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-6">
                  <Calculator size={22} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Repayment Optimization</h3>
                <p className="text-slate-400 text-sm">
                  Structured EMIs that align with your business cashflows or household monthly budgets. We calculate and recommend the optimum tenure to minimize FOIR load.
                </p>
              </div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-6">Customized Repayment</span>
            </div>
          </div>
        </div>
      </section>

      {/* Repayment Calculator (EMI) Section */}
      <section className="py-24 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
              Optimize repayments
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white">Compare EMI Outflow Instantly</h2>
            <p className="text-slate-400 text-sm">Slide parameters to review principal and interest allocations before matching.</p>
          </div>

          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-white/[0.01] border border-white/[0.03] p-8 md:p-10 rounded-[32px]">
            
            {/* Controls */}
            <div className="md:col-span-7 space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-400">Loan Amount</span>
                  <span className="text-blue-400">₹{calcAmt.toLocaleString('en-IN')}</span>
                </div>
                <input 
                  type="range"
                  min="100000"
                  max="15000000"
                  step="100000"
                  value={calcAmt}
                  onChange={(e) => setCalcAmt(parseInt(e.target.value))}
                  className="w-full accent-blue-500 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-400">Annual Interest Rate</span>
                  <span className="text-blue-400">{calcRate}% p.a.</span>
                </div>
                <input 
                  type="range"
                  min="7"
                  max="24"
                  step="0.1"
                  value={calcRate}
                  onChange={(e) => setCalcRate(parseFloat(e.target.value))}
                  className="w-full accent-blue-500 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-400">Repayment Period</span>
                  <span className="text-blue-400">{calcTerm} Years</span>
                </div>
                <input 
                  type="range"
                  min="1"
                  max="30"
                  step="1"
                  value={calcTerm}
                  onChange={(e) => setCalcTerm(parseInt(e.target.value))}
                  className="w-full accent-blue-500 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            {/* Results Card */}
            <div className="md:col-span-5 p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-black block">Your Monthly EMI</span>
              <div className="text-3xl font-black text-white">₹{emi.toLocaleString('en-IN')} <span className="text-xs text-slate-500 font-semibold">/ month</span></div>
              
              <div className="h-px bg-slate-800" />
              
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Principal Amount</span>
                  <span className="text-slate-300 font-semibold">₹{calcAmt.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Interest</span>
                  <span className="text-slate-300 font-semibold">₹{totalInterest.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between font-bold text-slate-200 pt-1">
                  <span>Total Payable</span>
                  <span className="text-emerald-400">₹{totalRepaid.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <a 
                href="#top" 
                onClick={(e) => {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="w-full py-3.5 mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1 shadow-md"
              >
                <span>Get Real Offers</span>
                <ArrowRight size={14} />
              </a>
            </div>

          </div>
        </div>
      </section>

      {/* Mascot-Inspired Visual Section */}
      <section className="py-20 border-t border-slate-900 bg-slate-950/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-4xl mx-auto space-y-6">
          <div className="w-16 h-16 bg-blue-500/10 border border-blue-500/25 rounded-2xl flex items-center justify-center mx-auto text-blue-400 shadow-lg shadow-blue-950/50">
            <Sparkles size={28} />
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white">Founder-Free, Advisory-Driven</h2>
          <p className="text-slate-400 text-base leading-relaxed max-w-2xl mx-auto">
            Click India Capital operates as an independent credit policy advisory agency. We evaluate your financials purely against credit matrices, meaning you receive objective guidance and private, secure documentation handling.
          </p>
        </div>
      </section>
    </div>
  );
}
