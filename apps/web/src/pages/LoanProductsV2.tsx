import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Car, Briefcase, UserCircle, Home, Sparkles, CheckCircle2, 
  ArrowRight, ShieldCheck, HelpCircle, ChevronDown, Clock, Percent, Calendar, HelpCircle as QuestionIcon
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function LoanProductsV2() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('type') || 'vehicle';
  
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Sync state with URL params
  const handleTabChange = (tabId: string) => {
    setSearchParams({ type: tabId });
    setOpenFaq(null);
  };

  const productData = {
    vehicle: {
      title: "Vehicle Loans",
      description: "Get customized financing for your mobility needs. We match profiles across new cars, used cars, commercial vehicles, and two-wheelers.",
      rate: "8.5%",
      tenure: "1 - 7 Years",
      funding: "Up to 100% on-road",
      turnaround: "24 - 48 Hours",
      specs: [
        { label: "Starting Rate", value: "8.5% p.a.", icon: Percent },
        { label: "Tenure Range", value: "1 - 7 Years", icon: Calendar },
        { label: "Max Funding", value: "100% On-Road", icon: Sparkles },
        { label: "Turnaround Time", value: "24 - 48 Hours", icon: Clock }
      ],
      useCases: [
        { title: "New Car Purchase", desc: "Access flexible tenures and low down payment options on new vehicles." },
        { title: "Used Car Loans", desc: "Get funding up to 150% of car valuation with minimal documentation." },
        { title: "Commercial Vehicles", desc: "Fleet or single-vehicle funding options matching your business cash flow." },
        { title: "Two Wheeler Finance", desc: "Instant digital approvals with paperless processing for select profiles." }
      ],
      faqs: [
        { question: "Do I need income proof for two-wheeler loans?", answer: "Not always. For select applicants with good credit history or existing relationships, our partners offer loans without formal income proofs." },
        { question: "What is the maximum age of a used vehicle for used car loans?", answer: "Lenders generally fund used vehicles that are up to 10-12 years of age at the end of the loan repayment term." },
        { question: "Can I get a loan for body-building of commercial trucks?", answer: "Yes, our lending partners offer custom commercial vehicle loans covering both chassis and cabin/body construction." }
      ]
    },
    personal: {
      title: "Personal Loans",
      description: "Quick, collateral-free credit lines for your personal needs, debt consolidation, or unexpected medical expenses.",
      rate: "10.5%",
      tenure: "1 - 5 Years",
      funding: "Up to ₹40 Lakhs",
      turnaround: "24 Hours",
      specs: [
        { label: "Starting Rate", value: "10.5% p.a.", icon: Percent },
        { label: "Tenure Range", value: "1 - 5 Years", icon: Calendar },
        { label: "Max Funding", value: "Up to ₹40 Lakhs", icon: Sparkles },
        { label: "Turnaround Time", value: "24 Hours", icon: Clock }
      ],
      useCases: [
        { title: "Debt Consolidation", desc: "Combine multiple high-interest credit obligations into a single, structured EMI." },
        { title: "Medical Emergencies", desc: "Quick disbursal within 24 hours to handle urgent healthcare expenses." },
        { title: "Home Renovation", desc: "Upgrade your living spaces without offering property collateral." },
        { title: "Education & Travel", desc: "Finance tuition fees, professional courses, or personal travel seamlessly." }
      ],
      faqs: [
        { question: "Will checking my personal loan eligibility lower my CIBIL score?", answer: "No, checking eligibility on our platform does not perform a hard pull on your credit report. Your credit score remains 100% safe." },
        { question: "What is the minimum monthly income required?", answer: "Generally, a net monthly income of ₹25,000 for salaried individuals is required, depending on your city of residence." },
        { question: "Can I prepay my personal loan early?", answer: "Yes. Most of our partner institutions allow loan foreclosure after 6 to 12 monthly installments, subject to minimal processing clauses." }
      ]
    },
    business: {
      title: "Business Loans",
      description: "Fuel your enterprise growth. Structuring unsecured working capital loans, machinery finance, and overdraft structures.",
      rate: "12.0%",
      tenure: "1 - 5 Years",
      funding: "Up to ₹5 Crores",
      turnaround: "3 - 5 Days",
      specs: [
        { label: "Starting Rate", value: "12.0% p.a.", icon: Percent },
        { label: "Tenure Range", value: "1 - 5 Years", icon: Calendar },
        { label: "Max Funding", value: "Up to ₹5 Crores", icon: Sparkles },
        { label: "Turnaround Time", value: "3 - 5 Days", icon: Clock }
      ],
      useCases: [
        { title: "Working Capital", desc: "Maintain inventory, purchase raw materials, and manage payroll cycles smoothly." },
        { title: "Machinery Purchase", desc: "Acquire high-value tools, hardware, or office equipment to scale production." },
        { title: "Retail Expansion", desc: "Open new stores, depots, or service outlets to widen customer reach." },
        { title: "Business Overdraft", desc: "Pay interest only on the amount you withdraw, optimizing overall finance costs." }
      ],
      faqs: [
        { question: "Are these business loans completely collateral-free?", answer: "Yes, we facilitate collateral-free business funding up to ₹50 Lakhs. Larger amounts are structured depending on annual turnover and business vintage." },
        { question: "What is the minimum operational history (vintage) required?", answer: "Most partner lenders look for a minimum business registration vintage of 2-3 years, with a positive GST filing record." },
        { question: "Is my business GST registration mandatory?", answer: "For loans up to ₹15 Lakhs, alternative income assessments are possible. For higher limits, GST registration is standard." }
      ]
    },
    home: {
      title: "Home Loans",
      description: "Build or buy your dream home with low rates, long tenure flexibility, and custom balance transfers.",
      rate: "8.35%",
      tenure: "Up to 30 Years",
      funding: "Up to 90% of value",
      turnaround: "5 - 7 Days",
      specs: [
        { label: "Starting Rate", value: "8.35% p.a.", icon: Percent },
        { label: "Tenure Range", value: "Up to 30 Years", icon: Calendar },
        { label: "Max Funding", value: "Up to 90% of Value", icon: Sparkles },
        { label: "Turnaround Time", value: "5 - 7 Days", icon: Clock }
      ],
      useCases: [
        { title: "Ready Property Purchase", desc: "Get funding for ready-to-move flats, apartments, or resale houses." },
        { title: "Self-Construction", desc: "Finance the construction of your house step-by-step on your owned plot." },
        { title: "Plot Purchase", desc: "Secure financial assistance to acquire vacant residential plots." },
        { title: "Home Balance Transfer", desc: "Transfer your high-interest home loan to lower interest alternatives." }
      ],
      faqs: [
        { question: "What documents are required for home loan approval?", answer: "Primary documents include PAN/Aadhaar cards, salary slips, last 3 years of ITRs, property sale agreement, and title deeds." },
        { question: "Can self-employed individuals apply for home loans?", answer: "Absolutely. We specialize in assessing self-employed income structures, bank statement patterns, and ITR details to establish high loan eligibility." },
        { question: "Are there foreclosure charges on floating-rate home loans?", answer: "No. Per regulatory policies, individual borrowers do not face any foreclosure or part-payment charges on floating-rate home loans." }
      ]
    }
  };

  const currentProduct = productData[activeTab as keyof typeof productData] || productData.vehicle;

  return (
    <div className="bg-[#030712] text-slate-100 min-h-screen relative overflow-hidden">
      {/* Visual background glows */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Hero Section */}
      <section className="relative pt-12 pb-24 border-b border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles size={12} /> Flexible Lending Options
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight leading-tight">
            Our <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400 bg-clip-text text-transparent">Financing Solutions</span>
          </h1>
          <p className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
            Diagnose your borrowing readiness and review customized financing structures for every need. Compare terms across premium options without early footprint registry.
          </p>
          
          {/* Tabs Selector Grid */}
          <div className="flex flex-wrap justify-center gap-3 pt-6 max-w-2xl mx-auto">
            {[
              { id: 'vehicle', label: 'Vehicle Loans', icon: Car },
              { id: 'personal', label: 'Personal Loans', icon: UserCircle },
              { id: 'business', label: 'Business Loans', icon: Briefcase },
              { id: 'home', label: 'Home Loans', icon: Home }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center gap-2.5 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-950' 
                      : 'bg-white/[0.01] border-white/[0.04] text-slate-400 hover:text-white hover:border-slate-800'
                  }`}
                >
                  <Icon size={14} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Product Specifications and Use Cases */}
          <div className="lg:col-span-8 space-y-12">
            
            {/* Title and Intro */}
            <div className="space-y-4">
              <span className="text-xs font-black uppercase text-indigo-400 tracking-widest block">
                Active Category Selection
              </span>
              <h2 className="text-3xl font-extrabold text-white">
                {currentProduct.title}
              </h2>
              <p className="text-slate-400 text-sm md:text-base leading-relaxed">
                {currentProduct.description}
              </p>
            </div>

            {/* Specs Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {currentProduct.specs.map((spec, index) => {
                const SpecIcon = spec.icon;
                return (
                  <div 
                    key={index}
                    className="p-5 rounded-2xl bg-white/[0.01] border border-white/[0.04] space-y-3"
                  >
                    <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                      <SpecIcon size={16} />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase tracking-widest font-black block">
                        {spec.label}
                      </span>
                      <span className="text-base font-extrabold text-white mt-0.5 block">
                        {spec.value}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Target Use-Cases & Card Grid */}
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="text-emerald-400" size={18} />
                <h3 className="text-lg font-bold text-white">Target Profiles & Key Use Cases</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentProduct.useCases.map((useCase, index) => (
                  <div 
                    key={index}
                    className="p-6 rounded-2xl bg-white/[0.01] border border-white/[0.04] hover:border-slate-800 transition-colors"
                  >
                    <h4 className="text-sm font-bold text-white mb-2">
                      {useCase.title}
                    </h4>
                    <p className="text-slate-400 text-xs md:text-sm leading-relaxed">
                      {useCase.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Product Specific FAQs with Collapsible Accordion (Dark-styled) */}
            <div className="space-y-6 pt-6">
              <div className="flex items-center gap-2">
                <QuestionIcon className="text-blue-400" size={18} />
                <h3 className="text-lg font-bold text-white">Frequently Asked Questions</h3>
              </div>

              <div className="space-y-3">
                {currentProduct.faqs.map((faq, idx) => {
                  const isOpen = openFaq === idx;
                  return (
                    <div 
                      key={idx}
                      className="rounded-2xl border border-white/[0.04] bg-white/[0.01] overflow-hidden transition-all duration-200"
                    >
                      <button
                        onClick={() => setOpenFaq(isOpen ? null : idx)}
                        className="w-full px-6 py-4 flex items-center justify-between text-left font-bold text-slate-300 hover:text-white transition-colors cursor-pointer"
                      >
                        <span className="text-xs md:text-sm pr-4">{faq.question}</span>
                        <ChevronDown 
                          size={16} 
                          className={`text-slate-500 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-blue-400' : ''}`}
                        />
                      </button>
                      
                      <div 
                        className={`transition-all duration-200 ease-in-out overflow-hidden ${
                          isOpen ? 'max-h-48 opacity-100 border-t border-white/[0.02]' : 'max-h-0 opacity-0'
                        }`}
                      >
                        <div className="px-6 py-4 text-xs md:text-sm text-slate-400 leading-relaxed bg-slate-950/20">
                          {faq.answer}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Right Column: CTA card & Cross-link explorative banners */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
            
            {/* Quick Action card */}
            <div className="p-8 rounded-[32px] bg-gradient-to-b from-blue-950/20 to-slate-950/40 border border-blue-500/10 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl" />
              
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-black block mb-2">
                Starting Interest Rate
              </span>
              <div className="flex justify-center items-baseline gap-1 mb-8">
                <span className="text-5xl font-black text-blue-400 tracking-tighter">
                  {currentProduct.rate}
                </span>
                <span className="text-slate-500 font-semibold text-sm">
                  p.a.
                </span>
              </div>
              
              <Link
                to={`/v2/eligibility?type=${activeTab}`}
                className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg hover:scale-[1.01] transition-all"
              >
                <span>Check Eligibility</span>
                <ArrowRight size={14} />
              </Link>
              
              <p className="text-slate-500 text-[10px] mt-4 font-bold uppercase tracking-widest">
                Takes 2 min • No CIBIL Impact
              </p>
            </div>

            {/* Consulting Advisory Promo Card */}
            <div className="p-6 rounded-2xl bg-white/[0.01] border border-white/[0.04] space-y-4 hover:border-slate-800 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white mb-1">
                  Facing Loan Rejections?
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Avoid applying repeatedly and damaging your credit profile. Let our expert underwriters diagnose and resolve credit-policy mismatch issues.
                </p>
              </div>
              <Link 
                to="/v2/advisory" 
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300"
              >
                <span>View Advisory Tiers</span>
                <ArrowRight size={12} />
              </Link>
            </div>

          </div>

        </div>
      </section>
    </div>
  );
}
