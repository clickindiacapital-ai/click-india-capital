import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Target, Activity, Map, ArrowRight } from 'lucide-react';
import ConsultingPricing from '../components/ConsultingPricing';

export default function Advisory() {
  const { t } = useTranslation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-slate-900 text-white">
        <div className="absolute inset-0 bg-blue-900/20"></div>
        <div className="absolute top-0 right-0 w-1/2 h-full bg-emerald-500/10 blur-[100px] rounded-full mix-blend-screen"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block mb-4 px-4 py-1.5 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-emerald-300 font-medium tracking-wide text-sm"
          >
            Premium Coaching
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-6xl font-extrabold mb-6 tracking-tight leading-tight"
          >
            {t('advisory.title')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed mb-10"
          >
            {t('advisory.subtitle')}
          </motion.p>
          <motion.a
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            href="#pricing"
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-full font-bold transition-all shadow-lg shadow-emerald-900/50 hover:shadow-emerald-900/70"
          >
            View Consulting Packages <ArrowRight className="w-5 h-5" />
          </motion.a>
        </div>
      </section>

      {/* Problem & Solution */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-red-100"
          >
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-8">
              <Target className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-6">{t('advisory.problem.title')}</h2>
            <p className="text-lg text-slate-600 mb-4">{t('advisory.problem.p1')}</p>
            <p className="text-lg text-slate-600">{t('advisory.problem.p2')}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-emerald-600 p-10 rounded-[2.5rem] shadow-xl text-white"
          >
            <div className="w-16 h-16 bg-white/20 text-white rounded-2xl flex items-center justify-center mb-8">
              <Activity className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-bold mb-6">{t('advisory.solution.title')}</h2>
            <p className="text-lg text-emerald-50 mb-4">{t('advisory.solution.p1')}</p>
            <p className="text-lg text-emerald-50">{t('advisory.solution.p2')}</p>
          </motion.div>
        </div>
      </section>

      {/* Process Steps */}
      <section className="py-20 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900">{t('advisory.process.title')}</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-blue-100 via-emerald-100 to-blue-100 -z-10"></div>
            
            <div className="text-center">
              <div className="w-24 h-24 mx-auto bg-blue-50 border-4 border-white rounded-full flex items-center justify-center text-blue-600 font-black text-2xl shadow-xl mb-6">1</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{t('advisory.process.step1.title')}</h3>
              <p className="text-slate-600">{t('advisory.process.step1.desc')}</p>
            </div>
            
            <div className="text-center">
              <div className="w-24 h-24 mx-auto bg-emerald-50 border-4 border-white rounded-full flex items-center justify-center text-emerald-600 font-black text-2xl shadow-xl mb-6">2</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{t('advisory.process.step2.title')}</h3>
              <p className="text-slate-600">{t('advisory.process.step2.desc')}</p>
            </div>

            <div className="text-center">
              <div className="w-24 h-24 mx-auto bg-purple-50 border-4 border-white rounded-full flex items-center justify-center text-purple-600 font-black text-2xl shadow-xl mb-6">3</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{t('advisory.process.step3.title')}</h3>
              <p className="text-slate-600">{t('advisory.process.step3.desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section Integration */}
      <div id="pricing">
        <ConsultingPricing />
      </div>
    </div>
  );
}
