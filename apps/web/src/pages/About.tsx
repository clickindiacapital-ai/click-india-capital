import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

export default function About() {
  const { t } = useTranslation();


  const credibility = t('about.credibility', { returnObjects: true }) as string[];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section 
        className="w-full py-20 lg:py-32 relative flex flex-col justify-center bg-cover bg-center bg-no-repeat border-b border-slate-100"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-emerald-50 opacity-90"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight mb-6">
              {t('about.title')}
            </h1>
            <p className="text-xl lg:text-2xl text-slate-600 font-medium leading-relaxed italic">
              "{t('about.subtitle')}"
            </p>
          </motion.div>
        </div>
      </section>

      {/* Credibility Strip */}
      <div className="bg-slate-900 text-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-4 text-sm md:text-base font-medium">
            {credibility.map((item, index) => (
              <div key={index} className="flex items-center">
                <span className="text-blue-400">{item}</span>
                {index < credibility.length - 1 && (
                  <span className="mx-4 text-slate-600">|</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* About Section */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="prose prose-lg prose-slate max-w-none text-slate-700 leading-relaxed"
          >
            <p className="text-xl font-medium text-slate-900 mb-8">{t('about.p1')}</p>
            <p className="mb-6">{t('about.p2')}</p>
            <p className="mb-6">{t('about.p3')}</p>
            <p className="mb-6">{t('about.p4')}</p>
            <p className="mb-6">{t('about.p5')}</p>
            <div className="text-xl font-medium text-slate-900 italic border-l-4 border-blue-600 pl-6 my-10 py-2">
              "{t('about.p6')}"
            </div>
          </motion.div>
        </div>
      </section>

      {/* Meet the Founder Section */}
      <section className="py-24 bg-slate-50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center"
          >
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <div className="relative w-72 h-72 md:w-96 md:h-96 rounded-full overflow-hidden border-8 border-white shadow-2xl">
                <img 
                  src="/advisory_lead.png" 
                  alt={t('about.founderName')}
                  className="w-full h-full object-cover object-top"
                />
              </div>
            </div>
            <div className="lg:col-span-7">
              <h2 className="text-3xl font-extrabold text-slate-900 mb-2">{t('about.founderTitle')}</h2>
              <h3 className="text-xl font-bold text-blue-600 mb-6">{t('about.founderName')}</h3>
              
              <div className="prose prose-lg prose-slate text-slate-700">
                <p className="mb-6">{t('about.founderP1')}</p>
                <p className="mb-6">{t('about.founderP2')}</p>
                <p className="font-medium text-slate-900">{t('about.founderP3')}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>


    </div>
  );
}
