import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { CheckCircle2, User } from 'lucide-react';

export default function FounderSection() {
  const { t } = useTranslation();

  return (
    <section className="py-24 bg-slate-50 border-y border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="w-full lg:w-1/2"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-blue-600 rounded-[2rem] transform rotate-3 scale-105 opacity-10"></div>
              <div className="bg-white p-2 rounded-[2rem] shadow-xl relative z-10 border border-slate-100 aspect-square flex items-center justify-center overflow-hidden">
                <User className="w-48 h-48 text-slate-200" />
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="w-full lg:w-1/2"
          >
            <h2 className="text-4xl font-extrabold text-slate-900 mb-2">{t('home.founder.title')}</h2>
            <h3 className="text-2xl font-bold text-blue-600 mb-6">{t('home.founder.name')}</h3>
            
            <p className="text-lg text-slate-700 leading-relaxed mb-6">
              {t('home.founder.description')}
            </p>
            
            <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-r-2xl mb-8">
              <p className="text-blue-900 font-medium italic">
                "{t('home.founder.philosophy')}"
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(t('home.founder.tags', { returnObjects: true }) as string[]).map((tag, i) => (
                <div key={i} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span className="text-slate-700 font-semibold">{tag}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
