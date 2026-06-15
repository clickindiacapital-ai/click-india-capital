import { ArrowRight, CheckCircle2, ShieldCheck, Zap, Car, Briefcase, UserCircle, Home as HomeIcon, Quote, Lock, FileKey } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import BorrowReadiness from '../components/BorrowReadiness';
import ConsultingPricing from '../components/ConsultingPricing';
import FounderSection from '../components/FounderSection';

export default function Home() {
  const { t } = useTranslation();

  const productCards = [
    { id: 'personal', icon: UserCircle, titleKey: 'products.personal.title', descKey: 'products.personal.description', color: 'blue' },
    { id: 'business', icon: Briefcase, titleKey: 'products.business.title', descKey: 'products.business.description', color: 'indigo' },
    { id: 'home', icon: HomeIcon, titleKey: 'products.home.title', descKey: 'products.home.description', color: 'emerald' },
    { id: 'vehicle', icon: Car, titleKey: 'products.vehicle.title', descKey: 'products.vehicle.description', color: 'purple' },
  ];


  return (
    <div className="bg-white">
      {/* Hero Banner Section */}
      <section 
        className="w-full min-h-[60vh] md:aspect-[21/9] overflow-hidden relative flex flex-col justify-center bg-cover bg-center bg-no-repeat py-20"
        style={{ backgroundImage: "url('/hero-bg.png')" }}
      >
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          {/* Vertically Centered Container */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-5xl mx-auto p-4 sm:p-8 md:p-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white font-medium text-sm mb-8 border border-white/20 shadow-sm">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              {t('home.promo')}
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-widest uppercase mb-4 drop-shadow-md sm:whitespace-nowrap leading-tight">
              {t('home.title1')}
            </h1>
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white drop-shadow-md mb-6 leading-tight sm:whitespace-nowrap pb-2">
              {t('home.title2')}
            </h2>
            <p className="text-2xl lg:text-3xl text-emerald-300 font-bold mb-6 leading-relaxed drop-shadow-md italic">
              {t('home.subtitle')}
            </p>
            <p className="text-lg lg:text-xl text-slate-100 font-semibold mb-10 leading-relaxed drop-shadow-md max-w-2xl mx-auto">
              {t('home.description')}
            </p>
            
            <div className="flex justify-center items-center">
              <Link to="/calculator" className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-semibold text-lg transition-all shadow-xl shadow-blue-900/50 flex items-center justify-center gap-2 group">
                {t('home.calculateEmi')}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="bg-slate-900 py-8 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 divide-x divide-slate-700/50">
            <div className="px-4 text-center">
              <div className="text-emerald-400 font-bold mb-1">{t('home.trustBar.exp')}</div>
            </div>
            <div className="px-4 text-center">
              <div className="text-emerald-400 font-bold mb-1">{t('home.trustBar.pan')}</div>
            </div>
            <div className="px-4 text-center">
              <div className="text-emerald-400 font-bold mb-1">{t('home.trustBar.partners')}</div>
            </div>
            <div className="px-4 text-center">
              <div className="text-emerald-400 font-bold mb-1">{t('home.trustBar.transparent')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-slate-50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { icon: Zap, title: "Lightning Fast Approval", desc: "Get your loan approved within 2 minutes of application." },
              { icon: ShieldCheck, title: "100% Secure Process", desc: "Bank-grade encryption for all your documents and data." },
              { icon: CheckCircle2, title: "Minimal Documentation", desc: "Paperless process with digital KYC and verification." }
            ].map((feature, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
                  <feature.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Loan Products Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h2 className="text-4xl font-extrabold text-slate-900 mb-4">{t('home.productsTitle')}</h2>
            <p className="text-lg text-slate-600">{t('home.productsSubtitle')}</p>
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
                  className="block h-full p-8 rounded-3xl border border-slate-100 bg-white hover:border-blue-200 hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300 group"
                >
                  <div className={`w-14 h-14 rounded-2xl bg-${product.color}-50 text-${product.color}-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <product.icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">
                    {t(product.titleKey)}
                  </h3>
                  <p className="text-slate-500 text-sm leading-relaxed mb-6 line-clamp-3">
                    {t(product.descKey)}
                  </p>
                  <div className="flex items-center text-sm font-bold text-blue-600">
                    {t('home.checkEligibility')}
                    <ArrowRight className="w-4 h-4 ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Consulting Pricing Section */}
      <ConsultingPricing />

      {/* Founder Section */}
      <FounderSection />

      {/* Borrow Readiness Section */}
      <section className="py-24 bg-slate-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-blue-100/50 -skew-x-12 transform translate-x-20"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <BorrowReadiness />
        </div>
      </section>


      {/* Security Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-6">
            <ShieldCheck className="w-8 h-8 text-slate-800" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-12">{t('home.security.title')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="flex flex-col items-center">
              <FileKey className="w-10 h-10 text-emerald-500 mb-4" />
              <h3 className="font-bold text-slate-800">{t('home.security.secure')}</h3>
            </div>
            <div className="flex flex-col items-center">
              <Lock className="w-10 h-10 text-emerald-500 mb-4" />
              <h3 className="font-bold text-slate-800">{t('home.security.encryption')}</h3>
            </div>
            <div className="flex flex-col items-center">
              <ShieldCheck className="w-10 h-10 text-emerald-500 mb-4" />
              <h3 className="font-bold text-slate-800">{t('home.security.privacy')}</h3>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Floating CTA */}
      <div className="md:hidden fixed bottom-4 left-20 right-20 z-40">
        <Link 
          to="/calculator"
          className="flex w-full items-center justify-center gap-2 px-4 py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-2xl shadow-blue-900/50"
        >
          <span className="truncate">{t('home.floatingCta')}</span>
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </div>
  );
}
