import { useTranslation } from 'react-i18next';
import { MessageSquare, PhoneCall, FileText, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ConsultingPricing() {
  const { t } = useTranslation();

  return (
    <div id="consulting" className="py-24 bg-slate-900 text-white border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl font-extrabold mb-4">{t('home.consulting.title')}</h2>
          <p className="text-lg text-slate-400">{t('home.consulting.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* WhatsApp Diagnosis */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-slate-800 rounded-3xl p-8 border border-slate-700 flex flex-col"
          >
            <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6">
              <MessageSquare className="w-7 h-7 text-emerald-400" />
            </div>
            <h3 className="text-2xl font-bold mb-2">{t('home.consulting.whatsapp.title')}</h3>
            <div className="text-3xl font-extrabold text-emerald-400 mb-4">{t('home.consulting.whatsapp.price')}</div>
            <p className="text-slate-400 mb-8 flex-grow">{t('home.consulting.whatsapp.desc')}</p>
            <a href="https://topmate.io/clickindiacapital/2155338" target="_blank" rel="noopener noreferrer" className="w-full py-4 bg-slate-700 hover:bg-emerald-600 text-white font-bold rounded-xl transition-colors text-center">
              {t('home.consulting.whatsapp.btn')}
            </a>
          </motion.div>

          {/* Expert Call */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-gradient-to-b from-blue-900 to-blue-800 rounded-3xl p-8 border border-blue-500 shadow-2xl shadow-blue-900/50 flex flex-col relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">POPULAR</div>
            <div className="w-14 h-14 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-6">
              <PhoneCall className="w-7 h-7 text-blue-300" />
            </div>
            <h3 className="text-2xl font-bold mb-2">{t('home.consulting.call.title')}</h3>
            <div className="text-3xl font-extrabold text-white mb-4">{t('home.consulting.call.price')}</div>
            <p className="text-blue-200 mb-8 flex-grow">{t('home.consulting.call.desc')}</p>
            <a href="https://topmate.io/clickindiacapital" target="_blank" rel="noopener noreferrer" className="w-full py-4 bg-white text-blue-900 hover:bg-blue-50 font-bold rounded-xl transition-colors text-center">
              {t('home.consulting.call.btn')}
            </a>
          </motion.div>

          {/* Blueprint */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-slate-800 rounded-3xl p-8 border border-slate-700 flex flex-col"
          >
            <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6">
              <FileText className="w-7 h-7 text-purple-400" />
            </div>
            <h3 className="text-2xl font-bold mb-2">{t('home.consulting.blueprint.title')}</h3>
            <div className="text-3xl font-extrabold text-purple-400 mb-4">{t('home.consulting.blueprint.price')}</div>
            <p className="text-slate-400 mb-8 flex-grow">{t('home.consulting.blueprint.desc')}</p>
            <a href="https://topmate.io/clickindiacapital" target="_blank" rel="noopener noreferrer" className="w-full py-4 bg-slate-700 hover:bg-purple-600 text-white font-bold rounded-xl transition-colors text-center">
              {t('home.consulting.blueprint.btn')}
            </a>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
