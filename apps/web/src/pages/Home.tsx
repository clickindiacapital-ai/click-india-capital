import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowRight, ShieldCheck, Zap, Car, Briefcase, UserCircle, 
  Home as HomeIcon, CheckCircle2, Calculator, Sparkles, HelpCircle, FileSearch, Target
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import BorrowerWizard from '../components/BorrowerWizard';
import MarqueeTrack from '../components/MarqueeTrack';
import LeadMagnet from '../components/LeadMagnet';

export default function Home() {
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

  const productCards = [
    { id: 'personal', icon: UserCircle, titleKey: 'products.personal.title', descKey: 'products.personal.description', color: 'blue' },
    { id: 'business', icon: Briefcase, titleKey: 'products.business.title', descKey: 'products.business.description', color: 'indigo' },
    { id: 'home', icon: HomeIcon, titleKey: 'products.home.title', descKey: 'products.home.description', color: 'emerald' },
    { id: 'vehicle', icon: Car, titleKey: 'products.vehicle.title', descKey: 'products.vehicle.description', color: 'purple' },
  ];

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen relative overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-10 pb-20 md:py-24 overflow-hidden">
        {/* Visual background glows restricted to Hero */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-100 rounded-full blur-[140px] pointer-events-none -z-10" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-indigo-100 rounded-full blur-[140px] pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Copy Hooks */}
            <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-600 text-xs font-bold uppercase tracking-wider">
                <Sparkles size={12} /> Smart Loan advisory Platform
              </span>
              
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
                Finance matched,<br />
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 bg-clip-text text-transparent">
                  eligibility verified.
                </span>
              </h1>
              
              <p className="text-slate-600 text-base md:text-lg leading-relaxed max-w-xl mx-auto lg:mx-0">
                Compare indicative lending thresholds across premium retail options in minutes. Get structured financial diagnostics and action plans to fix profile gaps before bank submission.
              </p>

              <div className="flex items-center justify-center lg:justify-start gap-3">
                <div className="flex -space-x-2.5">
                  <div className="w-8 h-8 rounded-full bg-blue-600 border border-white flex items-center justify-center text-[10px] font-bold text-white shadow-sm">CIC</div>
                  <div className="w-8 h-8 rounded-full bg-emerald-600 border border-white flex items-center justify-center text-[10px] font-bold text-white shadow-sm">AD</div>
                  <div className="w-8 h-8 rounded-full bg-indigo-600 border border-white flex items-center justify-center text-[10px] font-bold text-white shadow-sm">VA</div>
                </div>
                <span className="text-xs font-bold text-slate-500">Trusted expert advisor matching</span>
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

      {/* Light Theme Trust Bar */}
      <section className="bg-white py-8 relative z-20 border-y border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 divide-x divide-slate-100">
            <div className="px-4 text-center">
              <div className="text-emerald-600 font-bold mb-1">{t('home.trustBar.exp')}</div>
            </div>
            <div className="px-4 text-center">
              <div className="text-emerald-600 font-bold mb-1">{t('home.trustBar.pan')}</div>
            </div>
            <div className="px-4 text-center">
              <div className="text-emerald-600 font-bold mb-1">{t('home.trustBar.partners')}</div>
            </div>
            <div className="px-4 text-center">
              <div className="text-emerald-600 font-bold mb-1">{t('home.trustBar.transparent')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Loan Products Section (Light Premium) */}
      <section className="py-24 bg-slate-50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-16 space-y-4"
          >
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">{t('home.productsTitle')}</h2>
            <p className="text-slate-600 text-sm md:text-base">{t('home.productsSubtitle')}</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {productCards.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Link 
                  to={`/eligibility?type=${product.id}`}
                  className="block h-full p-8 rounded-3xl bg-white border border-slate-200 hover:shadow-xl hover:border-blue-200 transition-all duration-300 group relative overflow-hidden"
                >
                  <div className={`absolute top-0 right-0 w-24 h-24 bg-${product.color}-50 rounded-full blur-2xl group-hover:bg-${product.color}-100 transition-all`} />
                  <div className={`w-14 h-14 rounded-2xl bg-${product.color}-50 border border-${product.color}-100 text-${product.color}-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform relative z-10`}>
                    <product.icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors relative z-10">
                    {t(product.titleKey)}
                  </h3>
                  <p className="text-slate-500 text-sm leading-relaxed mb-6 line-clamp-3 relative z-10">
                    {t(product.descKey)}
                  </p>
                  <div className="flex items-center text-sm font-bold text-blue-600 relative z-10">
                    {t('home.checkEligibility')}
                    <ArrowRight className="w-4 h-4 ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Bento Grid Features Section */}
      <section className="relative z-10 py-24 border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">Reimagined Lending Diagnostics</h2>
            <p className="text-slate-600 text-sm md:text-base">We prioritize speed, security, and profile alignment over banking paperwork.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Bento Card 1 */}
            <div className="md:col-span-2 p-8 rounded-3xl bg-slate-50 border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-lg hover:border-slate-300 transition-all relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-full blur-2xl group-hover:bg-blue-200 transition-colors" />
              <div>
                <div className="w-12 h-12 rounded-2xl bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-600 mb-6 relative z-10">
                  <Zap size={22} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2 relative z-10">Indicative Approval Diagnostics</h3>
                <p className="text-slate-600 text-sm relative z-10">
                  Evaluate your eligibility index against 20+ NBFC and Bank frameworks before doing hard CIBIL inquiries. Avoid standard rejections due to high FOIR or unoptimized credit mix.
                </p>
              </div>
              <div className="flex gap-6 mt-8 relative z-10">
                <div>
                  <div className="text-xl font-extrabold text-slate-900">2 Min</div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">Eligibility assessment</div>
                </div>
                <div className="w-px bg-slate-200" />
                <div>
                  <div className="text-xl font-extrabold text-slate-900">100%</div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">CIBIL Protection</div>
                </div>
              </div>
            </div>

            {/* Bento Card 2 */}
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-lg hover:border-slate-300 transition-all group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-6">
                  <ShieldCheck size={22} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Data Protection Vault</h3>
                <p className="text-slate-600 text-sm">
                  Your files are secure. Enjoy bank-grade document vaults and structured privacy filters on all applications.
                </p>
              </div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-6">Encrypted Vault</span>
            </div>

            {/* Bento Card 3 */}
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-lg hover:border-slate-300 transition-all group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-600 mb-6">
                  <UserCircle size={22} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Expert Team Support</h3>
                <p className="text-slate-600 text-sm">
                  Our credit advisory lead coordinates directly with underwriters to clear bottlenecks. No call centers, just real advisors.
                </p>
              </div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-6">Dedicated Experts</span>
            </div>

            {/* Bento Card 4 */}
            <div className="md:col-span-2 p-8 rounded-3xl bg-slate-50 border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-lg hover:border-slate-300 transition-all group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-600 mb-6">
                  <Calculator size={22} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Repayment Optimization</h3>
                <p className="text-slate-600 text-sm">
                  Structured EMIs that align with your business cashflows or household monthly budgets. We calculate and recommend the optimum tenure to minimize FOIR load.
                </p>
              </div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-6">Customized Repayment</span>
            </div>
          </div>
        </div>
      </section>

      {/* Repayment Calculator (EMI) Section */}
      <section className="relative z-10 py-24 border-t border-slate-200 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-wider">
              Optimize repayments
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">Compare EMI Outflow Instantly</h2>
            <p className="text-slate-600 text-sm">Slide parameters to review principal and interest allocations before matching.</p>
          </div>

          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-white border border-slate-200 shadow-xl p-8 md:p-10 rounded-[32px]">
            
            {/* Controls */}
            <div className="md:col-span-7 space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-600">Loan Amount</span>
                  <span className="text-blue-600">₹{calcAmt.toLocaleString('en-IN')}</span>
                </div>
                <input 
                  type="range"
                  min="100000"
                  max="15000000"
                  step="100000"
                  value={calcAmt}
                  onChange={(e) => setCalcAmt(parseInt(e.target.value))}
                  className="w-full accent-blue-600 bg-slate-200 rounded-lg cursor-pointer h-2"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-600">Annual Interest Rate</span>
                  <span className="text-blue-600">{calcRate}% p.a.</span>
                </div>
                <input 
                  type="range"
                  min="7"
                  max="24"
                  step="0.1"
                  value={calcRate}
                  onChange={(e) => setCalcRate(parseFloat(e.target.value))}
                  className="w-full accent-blue-600 bg-slate-200 rounded-lg cursor-pointer h-2"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-600">Repayment Period</span>
                  <span className="text-blue-600">{calcTerm} Years</span>
                </div>
                <input 
                  type="range"
                  min="1"
                  max="30"
                  step="1"
                  value={calcTerm}
                  onChange={(e) => setCalcTerm(parseInt(e.target.value))}
                  className="w-full accent-blue-600 bg-slate-200 rounded-lg cursor-pointer h-2"
                />
              </div>
            </div>

            {/* Results Card */}
            <div className="md:col-span-5 p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-black block">Your Monthly EMI</span>
              <div className="text-3xl font-black text-slate-900">₹{emi.toLocaleString('en-IN')} <span className="text-xs text-slate-500 font-semibold">/ month</span></div>
              
              <div className="h-px bg-slate-200" />
              
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Principal Amount</span>
                  <span className="text-slate-700 font-semibold">₹{calcAmt.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Interest</span>
                  <span className="text-slate-700 font-semibold">₹{totalInterest.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between font-bold text-slate-900 pt-1">
                  <span>Total Payable</span>
                  <span className="text-emerald-600">₹{totalRepaid.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <a 
                href="#top" 
                onClick={(e) => {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="w-full py-3.5 mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1 shadow-md"
              >
                <span>Get Real Offers</span>
                <ArrowRight size={14} />
              </a>
            </div>

          </div>
        </div>
      </section>

      {/* Lead Magnet / Free Resource Section */}
      <LeadMagnet />

      {/* Loan Rejected Section (Light Premium) */}
      <section className="py-20 bg-red-50 border-t border-red-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-red-100 -skew-x-12 transform translate-x-20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-1/3 h-full bg-orange-100 rounded-full blur-3xl transform -translate-x-1/2"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 border border-red-200 rounded-2xl mb-6 shadow-sm">
            <ShieldCheck className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6">
            Loan Rejected?<br/><span className="text-red-600">Don't Lose Hope.</span>
          </h2>
          <p className="text-slate-700 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
            Get your profile reviewed by an expert with over 25 years of lending experience. Understand why your loan was rejected, what can be improved, and explore alternative options available.
          </p>
          <Link to="/calculator" className="inline-flex items-center gap-2 px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-full font-bold text-lg transition-all shadow-xl shadow-red-200">
            Get Expert Review
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Mascot-Inspired Visual Section */}
      <section className="relative z-10 py-20 border-t border-slate-200 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="md:w-1/2 space-y-6 text-center md:text-left">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-50 border border-blue-100 rounded-2xl text-blue-600 shadow-sm mb-2">
                <Sparkles size={24} />
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">Meet Your New Financial Advisor</h2>
              <p className="text-slate-600 text-lg leading-relaxed">
                Click India Capital operates as an independent credit policy advisory agency. We evaluate your financials purely against credit matrices, meaning you receive objective guidance and private, secure documentation handling.
              </p>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-100 rounded-full blur-3xl transform scale-150"></div>
                <img src="/mascot.png" alt="Friendly Advisor Mascot" className="relative z-10 w-72 h-72 md:w-96 md:h-96 object-contain drop-shadow-2xl hover:-translate-y-4 transition-transform duration-500" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
