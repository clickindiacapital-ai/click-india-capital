import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, CheckCircle2, AlertTriangle, Calculator } from 'lucide-react';

export default function BorrowReadiness() {
  const { t } = useTranslation();
  
  const [step, setStep] = useState(1);
  const [isCalculating, setIsCalculating] = useState(false);
  const [result, setResult] = useState<'high' | 'medium' | 'low' | null>(null);
  
  const [formData, setFormData] = useState({
    loanType: '',
    monthlyIncome: '',
    employment: '',
    existingEmi: '',
    creditScore: '',
    city: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleNext = () => {
    if (step < 6) setStep(step + 1);
    else calculateScore();
  };

  const calculateScore = () => {
    setIsCalculating(true);
    // Simulate calculation time to build anticipation
    setTimeout(() => {
      setIsCalculating(false);
      const score = parseInt(formData.creditScore) || 0;
      const income = parseInt(formData.monthlyIncome) || 0;
      const emi = parseInt(formData.existingEmi) || 0;
      
      let finalResult: 'high' | 'medium' | 'low' = 'low';
      
      // Basic indicative logic
      if (score >= 750 && (emi / income) < 0.5) {
        finalResult = 'high';
      } else if (score >= 650 && (emi / income) < 0.6) {
        finalResult = 'medium';
      }
      
      setResult(finalResult);
    }, 1500);
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden max-w-2xl mx-auto">
      <div className="bg-blue-600 p-6 text-center text-white">
        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
          <Calculator className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-2xl font-bold mb-2">{t('home.readiness.title')}</h3>
        <p className="text-blue-100 text-sm">{t('home.readiness.subtitle')}</p>
      </div>
      
      <div className="p-8">
        {!result && !isCalculating && (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
              <span className="text-sm font-semibold text-slate-400">Step {step} of 6</span>
              <div className="flex gap-1">
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} className={`h-1.5 w-6 rounded-full ${i <= step ? 'bg-blue-600' : 'bg-slate-200'}`} />
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
                className="space-y-4"
              >
                {step === 1 && (
                  <div>
                    <label className="block text-lg font-bold text-slate-800 mb-3">{t('home.readiness.loanType')}</label>
                    <select name="loanType" value={formData.loanType} onChange={handleChange} className="w-full p-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 text-lg">
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
                    <label className="block text-lg font-bold text-slate-800 mb-3">{t('home.readiness.employment')}</label>
                    <select name="employment" value={formData.employment} onChange={handleChange} className="w-full p-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 text-lg">
                      <option value="">Select Option</option>
                      <option value="Salaried">Salaried</option>
                      <option value="SelfEmployed">Self Employed</option>
                    </select>
                  </div>
                )}
                {step === 3 && (
                  <div>
                    <label className="block text-lg font-bold text-slate-800 mb-3">{t('home.readiness.monthlyIncome')}</label>
                    <input type="number" name="monthlyIncome" value={formData.monthlyIncome} onChange={handleChange} placeholder="e.g. 50000" className="w-full p-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 text-lg" />
                  </div>
                )}
                {step === 4 && (
                  <div>
                    <label className="block text-lg font-bold text-slate-800 mb-3">{t('home.readiness.existingEmi')}</label>
                    <input type="number" name="existingEmi" value={formData.existingEmi} onChange={handleChange} placeholder="e.g. 15000" className="w-full p-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 text-lg" />
                  </div>
                )}
                {step === 5 && (
                  <div>
                    <label className="block text-lg font-bold text-slate-800 mb-3">{t('home.readiness.creditScore')}</label>
                    <select name="creditScore" value={formData.creditScore} onChange={handleChange} className="w-full p-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 text-lg">
                      <option value="">Select Option</option>
                      <option value="750">Excellent (750+)</option>
                      <option value="650">Good (650 - 749)</option>
                      <option value="550">Average (550 - 649)</option>
                      <option value="0">Low/No History</option>
                    </select>
                  </div>
                )}
                {step === 6 && (
                  <div>
                    <label className="block text-lg font-bold text-slate-800 mb-3">{t('home.readiness.city')}</label>
                    <input type="text" name="city" value={formData.city} onChange={handleChange} placeholder="e.g. Mumbai" className="w-full p-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 text-lg" />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            <button
              onClick={handleNext}
              disabled={
                (step === 1 && !formData.loanType) ||
                (step === 2 && !formData.employment) ||
                (step === 3 && !formData.monthlyIncome) ||
                (step === 4 && !formData.existingEmi) ||
                (step === 5 && !formData.creditScore) ||
                (step === 6 && !formData.city)
              }
              className="w-full py-4 mt-6 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold rounded-xl transition-colors flex justify-center items-center gap-2"
            >
              {step === 6 ? t('home.readiness.btnCalculate') : 'Next'}
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {isCalculating && (
          <div className="py-12 text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <h3 className="text-xl font-bold text-slate-800">Analyzing your profile...</h3>
          </div>
        )}

        {result && !isCalculating && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${result === 'high' ? 'bg-emerald-100 text-emerald-600' : result === 'medium' ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600'}`}>
              {result === 'high' ? <CheckCircle2 className="w-10 h-10" /> : <AlertTriangle className="w-10 h-10" />}
            </div>
            
            <h3 className="text-2xl font-bold text-slate-800 mb-2">{t('home.readiness.resultTitle')}</h3>
            <div className="text-lg text-slate-600 mb-8">
              {t('home.readiness.scoreLabel')} <span className={`font-bold ${result === 'high' ? 'text-emerald-600' : result === 'medium' ? 'text-amber-600' : 'text-red-600'}`}>{t(`home.readiness.${result}`)}</span>
            </div>

            <div className="space-y-4">
              {result === 'high' ? (
                <a href="#consulting" className="block w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors shadow-lg">
                  {t('home.readiness.ctaHigh')}
                </a>
              ) : (
                <a href="#consulting" className="block w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors shadow-lg">
                  {t('home.readiness.ctaLow')}
                </a>
              )}
              <button onClick={() => { setStep(1); setResult(null); }} className="text-sm text-slate-500 font-medium hover:text-slate-800 transition-colors">
                Recalculate
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-6">{t('home.readiness.disclaimer')}</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
