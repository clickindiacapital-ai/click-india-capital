import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function EligibilityCheck() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const urlType = searchParams.get('type');

  const [step, setStep] = useState(urlType ? 2 : 1);
  const [loanType, setLoanType] = useState(urlType || '');
  const [loading, setLoading] = useState(false);
  const [approved, setApproved] = useState(false);

  useEffect(() => {
    if (urlType) {
      setLoanType(urlType);
      setStep(2);
    } else {
      setLoanType('');
      setStep(1);
    }
  }, [urlType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
    } else {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setApproved(true);
      }, 1500);
    }
  };

  const handleLoanTypeSelect = (type: string) => {
    setLoanType(type);
    navigate(`?type=${type}`, { replace: true });
    setStep(2);
  };

  if (approved) {
    return (
      <div className="max-w-2xl mx-auto mt-20 p-8 bg-white rounded-3xl shadow-xl shadow-emerald-100 border border-emerald-100 text-center">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 mb-4">{t('eligibility.approvedTitle')}</h2>
        <p className="text-slate-600 mb-8 text-lg">{t('eligibility.approvedSubtitle', { type: t(`eligibility.loanTypes.${loanType}`) || loanType })}</p>
        <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-full font-bold text-lg transition-all shadow-lg shadow-emerald-200">
          {t('eligibility.proceed')}
        </button>
      </div>
    );
  }

  const renderStep2Fields = () => {
    switch (loanType) {
      case 'personal':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">{t('eligibility.fields.employmentType')}</label>
              <select className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none" required>
                <option value="">{t('eligibility.fields.selectEmployment')}</option>
                <option value="salaried">{t('eligibility.fields.salaried')}</option>
                <option value="self_employed">{t('eligibility.fields.selfEmployed')}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">{t('eligibility.fields.netSalary')}</label>
              <input type="number" className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">{t('eligibility.fields.companyName')}</label>
              <input type="text" className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none" required />
            </div>
          </>
        );
      case 'business':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">{t('eligibility.fields.businessVintage')}</label>
              <input type="number" className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">{t('eligibility.fields.annualTurnover')}</label>
              <input type="number" className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">{t('eligibility.fields.gstRegistered')}</label>
              <select className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none" required>
                <option value="">{t('eligibility.fields.selectOption')}</option>
                <option value="yes">{t('eligibility.fields.yes')}</option>
                <option value="no">{t('eligibility.fields.no')}</option>
              </select>
            </div>
          </>
        );
      case 'vehicle':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">{t('eligibility.fields.vehicleType')}</label>
              <select className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none" required>
                <option value="">{t('eligibility.fields.selectType')}</option>
                <option value="new">{t('eligibility.fields.newVehicle')}</option>
                <option value="used">{t('eligibility.fields.usedVehicle')}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">{t('eligibility.fields.onRoadPrice')}</label>
              <input type="number" className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">{t('eligibility.fields.desiredLoan')}</label>
              <input type="number" className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none" required />
            </div>
          </>
        );
      case 'home':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">{t('eligibility.fields.propertyStatus')}</label>
              <select className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none" required>
                <option value="">{t('eligibility.fields.selectStatus')}</option>
                <option value="ready">{t('eligibility.fields.readyToMove')}</option>
                <option value="under_construction">{t('eligibility.fields.underConstruction')}</option>
                <option value="plot">{t('eligibility.fields.plotPurchase')}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">{t('eligibility.fields.propertyValue')}</label>
              <input type="number" className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">{t('eligibility.fields.existingEmis')}</label>
              <input type="number" className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none" required />
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-12 p-8 bg-white rounded-3xl shadow-sm border border-slate-200">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">{t('eligibility.title')}</h1>
        <p className="text-slate-500">{t('eligibility.subtitle')}</p>
      </div>

      <div className="flex gap-2 mb-8">
        {[1, 2, 3].map(i => (
          <div key={i} className={`h-2 flex-1 rounded-full ${i <= step ? 'bg-blue-600' : 'bg-slate-100'}`} />
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-4">{t('eligibility.step1')}</label>
            <div className="grid grid-cols-2 gap-4">
              {[
                { id: 'vehicle', label: t('eligibility.loanTypes.vehicle') },
                { id: 'personal', label: t('eligibility.loanTypes.personal') },
                { id: 'business', label: t('eligibility.loanTypes.business') },
                { id: 'home', label: t('eligibility.loanTypes.home') }
              ].map(type => (
                <button 
                  key={type.id} 
                  type="button"
                  onClick={() => handleLoanTypeSelect(type.id)}
                  className="p-4 border border-slate-200 rounded-xl cursor-pointer hover:border-blue-600 hover:bg-blue-50 transition-colors text-left font-medium text-slate-900"
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {step > 1 && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex justify-between items-center mb-6">
                <span className="text-blue-800 font-medium capitalize">{t('eligibility.applicationTitle', { type: t(`eligibility.loanTypes.${loanType}`) || loanType })}</span>
                <button type="button" onClick={() => { setStep(1); navigate('?', { replace: true }); }} className="text-sm text-blue-600 hover:underline">{t('eligibility.change')}</button>
              </div>
              {renderStep2Fields()}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">{t('eligibility.fields.fullName')}</label>
                <input type="text" className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">{t('eligibility.fields.mobile')}</label>
                <input type="tel" className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none" required pattern="[0-9]{10}" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">{t('eligibility.fields.pan')}</label>
                <input type="text" className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none uppercase" required pattern="[a-zA-Z]{5}[0-9]{4}[a-zA-Z]{1}" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">{t('eligibility.fields.documents')}</label>
                <input type="file" multiple className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none bg-slate-50 text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer" />
                <p className="text-xs text-slate-500 mt-2">{t('eligibility.fields.documentsHint')}</p>
              </div>
              
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="flex items-center h-6">
                    <input type="checkbox" required className="w-5 h-5 border-2 border-slate-300 rounded text-blue-600 focus:ring-blue-600 cursor-pointer" />
                  </div>
                  <span className="text-sm text-slate-600 leading-relaxed group-hover:text-slate-900 transition-colors">
                    {t('eligibility.consents.communication')}
                  </span>
                </label>
                
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="flex items-center h-6">
                    <input type="checkbox" required className="w-5 h-5 border-2 border-slate-300 rounded text-blue-600 focus:ring-blue-600 cursor-pointer" />
                  </div>
                  <span className="text-sm text-slate-600 leading-relaxed group-hover:text-slate-900 transition-colors">
                    {t('eligibility.consents.documents')}
                  </span>
                </label>
              </div>
            </div>
          )}

          <div className="pt-4 flex gap-4">
            <button type="button" onClick={() => setStep(step - 1)} className="px-6 py-4 rounded-xl border border-slate-200 font-medium text-slate-600 hover:bg-slate-50 transition-colors">
              {t('eligibility.back')}
            </button>
            <button type="submit" disabled={loading} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold transition-colors flex justify-center items-center">
              {loading ? <span className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></span> : (step === 3 ? t('eligibility.checkEligibility') : t('eligibility.continue'))}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
