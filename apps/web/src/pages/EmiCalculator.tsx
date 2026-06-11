import { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useTranslation } from 'react-i18next';

export default function EmiCalculator() {
  const { t } = useTranslation();
  
  const [amount, setAmount] = useState(5000000);
  const [rate, setRate] = useState(8.5);
  const [tenure, setTenure] = useState(20); // in years
  const [activePreset, setActivePreset] = useState('home');

  // EMI Formula: P x R x (1+R)^N / [(1+R)^N-1]
  const p = amount || 0;
  const r = (rate || 0) / 12 / 100;
  const n = (tenure || 0) * 12;
  
  const emi = p > 0 && r > 0 && n > 0 ? (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : 0;
  const totalAmount = emi * n;
  const totalInterest = totalAmount > p ? totalAmount - p : 0;

  const chartData = [
    { name: t('emi.principalAmount'), value: p, color: '#3b82f6' },
    { name: t('emi.totalInterest'), value: totalInterest, color: '#93c5fd' },
  ];

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  // Calculate Amortization Schedule
  const generateSchedule = () => {
    if (emi <= 0) return [];
    
    const schedule = [];
    let balance = p;
    
    for (let year = 1; year <= tenure; year++) {
      let principalForYear = 0;
      let interestForYear = 0;
      
      for (let month = 1; month <= 12; month++) {
        if (balance <= 0) break;
        const interestForMonth = balance * r;
        let principalForMonth = emi - interestForMonth;
        
        if (balance - principalForMonth < 0) {
          principalForMonth = balance;
        }
        
        interestForYear += interestForMonth;
        principalForYear += principalForMonth;
        balance -= principalForMonth;
      }
      
      schedule.push({
        year,
        principalPaid: principalForYear,
        interestPaid: interestForYear,
        totalPayment: principalForYear + interestForYear,
        balance: balance > 0 ? balance : 0,
      });
    }
    return schedule;
  };

  const scheduleData = generateSchedule();

  const handlePreset = (type: string) => {
    setActivePreset(type);
    if (type === 'home') {
      setAmount(5000000); setRate(8.5); setTenure(20);
    } else if (type === 'personal') {
      setAmount(500000); setRate(12.0); setTenure(5);
    } else if (type === 'car') {
      setAmount(800000); setRate(9.5); setTenure(5);
    } else if (type === 'business') {
      setAmount(2000000); setRate(10.5); setTenure(10);
    }
  };

  return (
    <div className="max-w-6xl mx-auto mt-12 p-4">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">{t('emi.title')}</h1>
        <p className="text-slate-600 text-lg">{t('emi.subtitle')}</p>
      </div>

      {/* Presets */}
      <div className="flex flex-wrap justify-center gap-4 mb-10">
        <button onClick={() => handlePreset('home')} className={`px-6 py-2.5 rounded-full font-medium transition-all ${activePreset === 'home' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
          {t('emi.presets.homeLoan')}
        </button>
        <button onClick={() => handlePreset('personal')} className={`px-6 py-2.5 rounded-full font-medium transition-all ${activePreset === 'personal' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
          {t('emi.presets.personalLoan')}
        </button>
        <button onClick={() => handlePreset('car')} className={`px-6 py-2.5 rounded-full font-medium transition-all ${activePreset === 'car' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
          {t('emi.presets.carLoan')}
        </button>
        <button onClick={() => handlePreset('business')} className={`px-6 py-2.5 rounded-full font-medium transition-all ${activePreset === 'business' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
          {t('emi.presets.businessLoan')}
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 flex flex-col lg:flex-row gap-12 mb-12">
        {/* Controls */}
        <div className="flex-1 space-y-10">
          <div>
            <div className="flex justify-between items-center mb-4">
              <label className="font-medium text-slate-700">{t('emi.loanAmount')}</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium">₹</span>
                <input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="w-32 pl-7 pr-3 py-1.5 bg-blue-50/50 border border-blue-100 rounded-lg font-bold text-blue-700 text-right focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none" />
              </div>
            </div>
            <input type="range" min="50000" max="50000000" step="10000" value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
            <div className="flex justify-between text-xs text-slate-400 mt-2">
              <span>₹50K</span>
              <span>₹5Cr</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <label className="font-medium text-slate-700">{t('emi.interestRate')}</label>
              <div className="relative">
                <input type="number" value={rate} onChange={(e) => setRate(Number(e.target.value))} step="0.1" className="w-24 px-3 py-1.5 bg-blue-50/50 border border-blue-100 rounded-lg font-bold text-blue-700 text-right focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium">%</span>
              </div>
            </div>
            <input type="range" min="5" max="24" step="0.1" value={rate} onChange={(e) => setRate(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
            <div className="flex justify-between text-xs text-slate-400 mt-2">
              <span>5%</span>
              <span>24%</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <label className="font-medium text-slate-700">{t('emi.tenure')}</label>
              <div className="relative">
                <input type="number" value={tenure} onChange={(e) => setTenure(Number(e.target.value))} className="w-24 px-3 py-1.5 bg-blue-50/50 border border-blue-100 rounded-lg font-bold text-blue-700 text-right focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium">Yrs</span>
              </div>
            </div>
            <input type="range" min="1" max="30" step="1" value={tenure} onChange={(e) => setTenure(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
            <div className="flex justify-between text-xs text-slate-400 mt-2">
              <span>1 Yr</span>
              <span>30 Yrs</span>
            </div>
          </div>
        </div>

        {/* Results Overview */}
        <div className="lg:w-[400px] bg-slate-50 rounded-2xl p-8 flex flex-col justify-center border border-slate-100">
          <div className="text-center mb-8">
            <p className="text-slate-500 font-medium mb-2">{t('emi.monthlyEmi')}</p>
            <h2 className="text-5xl font-extrabold text-slate-900">{formatCurrency(emi)}</h2>
          </div>

          <div className="h-48 mb-8">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-slate-600">{t('emi.principalAmount')}</span>
              </div>
              <span className="font-semibold text-slate-900">{formatCurrency(p)}</span>
            </div>
            <div className="flex justify-between items-center pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-300"></div>
                <span className="text-slate-600">{t('emi.totalInterest')}</span>
              </div>
              <span className="font-semibold text-slate-900">{formatCurrency(totalInterest)}</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-slate-800 font-bold">{t('emi.totalPayable')}</span>
              <span className="font-bold text-slate-900 text-lg">{formatCurrency(totalAmount)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Amortization Schedule Table */}
      {scheduleData.length > 0 && (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200 bg-slate-50">
            <h3 className="text-xl font-bold text-slate-800">{t('emi.schedule.title')}</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-slate-200">
                  <th className="py-4 px-6 font-semibold text-slate-600">{t('emi.schedule.year')}</th>
                  <th className="py-4 px-6 font-semibold text-slate-600">{t('emi.schedule.principalPaid')}</th>
                  <th className="py-4 px-6 font-semibold text-slate-600">{t('emi.schedule.interestPaid')}</th>
                  <th className="py-4 px-6 font-semibold text-slate-600">{t('emi.schedule.totalPayment')}</th>
                  <th className="py-4 px-6 font-semibold text-slate-600">{t('emi.schedule.balance')}</th>
                </tr>
              </thead>
              <tbody>
                {scheduleData.map((row) => (
                  <tr key={row.year} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 font-medium text-slate-900">{row.year}</td>
                    <td className="py-4 px-6 text-slate-600">{formatCurrency(row.principalPaid)}</td>
                    <td className="py-4 px-6 text-slate-600">{formatCurrency(row.interestPaid)}</td>
                    <td className="py-4 px-6 text-slate-600 font-medium">{formatCurrency(row.totalPayment)}</td>
                    <td className="py-4 px-6 text-slate-900 font-medium">{formatCurrency(row.balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
