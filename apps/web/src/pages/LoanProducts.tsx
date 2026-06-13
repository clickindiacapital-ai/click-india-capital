import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Car, Briefcase, UserCircle, Home, Bike, Truck, Sparkles, CheckCircle2, ArrowRight, RefreshCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export default function LoanProducts() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type') || 'vehicle';

  const [subType, setSubType] = useState('newCar');

  const vehicleSubProducts = {
    twoWheeler: {
      id: 'twoWheeler',
      icon: Bike,
      title: t('products.vehicle.subTypes.twoWheeler.title'),
      rate: "11.5%",
      features: t('products.vehicle.subTypes.twoWheeler.features', { returnObjects: true }) as string[]
    },
    newCar: {
      id: 'newCar',
      icon: Sparkles,
      title: t('products.vehicle.subTypes.newCar.title'),
      rate: "8.5%",
      features: t('products.vehicle.subTypes.newCar.features', { returnObjects: true }) as string[]
    },
    usedCar: {
      id: 'usedCar',
      icon: Car,
      title: t('products.vehicle.subTypes.usedCar.title'),
      rate: "12.5%",
      features: t('products.vehicle.subTypes.usedCar.features', { returnObjects: true }) as string[]
    },
    commercial: {
      id: 'commercial',
      icon: Truck,
      title: t('products.vehicle.subTypes.commercial.title'),
      rate: "10.0%",
      features: t('products.vehicle.subTypes.commercial.features', { returnObjects: true }) as string[]
    },
    refinance: {
      id: 'refinance',
      icon: RefreshCcw,
      title: t('products.vehicle.subTypes.refinance.title'),
      rate: "11.0%",
      features: t('products.vehicle.subTypes.refinance.features', { returnObjects: true }) as string[]
    }
  };

  const products = {
    vehicle: {
      icon: Car,
      title: t('products.vehicle.title'),
      description: t('products.vehicle.description'),
      isVehicle: true
    },
    personal: {
      icon: UserCircle,
      title: t('products.personal.title'),
      description: t('products.personal.description'),
      rate: "10.5%",
      features: t('products.personal.features', { returnObjects: true }) as string[]
    },
    business: {
      icon: Briefcase,
      title: t('products.business.title'),
      description: t('products.business.description'),
      rate: "12.0%",
      features: t('products.business.features', { returnObjects: true }) as string[]
    },
    home: {
      icon: Home,
      title: t('products.home.title'),
      description: t('products.home.description'),
      rate: "8.35%",
      features: t('products.home.features', { returnObjects: true }) as string[]
    }
  };

  const currentProduct = products[type as keyof typeof products] || products.vehicle;
  const MainIcon = currentProduct.icon;
  
  const displayData = currentProduct.isVehicle 
    ? vehicleSubProducts[subType as keyof typeof vehicleSubProducts] 
    : currentProduct;

  const animationProps = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.4 }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 pt-32 pb-24 px-4 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4"></div>
        
        <div className="max-w-5xl mx-auto relative z-10 text-center">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="w-24 h-24 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center mx-auto mb-8 border border-white/20 shadow-2xl"
          >
            <MainIcon className="w-12 h-12 text-white" />
          </motion.div>
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tight"
          >
            {currentProduct.title}
          </motion.h1>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed"
          >
            {currentProduct.description}
          </motion.p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-12 relative z-20">
        {/* Sub-categories for Vehicle Loans */}
        {currentProduct.isVehicle && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-12"
          >
            {Object.values(vehicleSubProducts).map((sub) => {
              const SubIcon = sub.icon;
              const isActive = subType === sub.id;
              return (
                <button
                  key={sub.id}
                  onClick={() => setSubType(sub.id)}
                  className={`flex flex-col items-center p-6 rounded-2xl border-2 transition-all duration-300 ${
                    isActive 
                      ? 'bg-white border-blue-600 shadow-xl shadow-blue-900/5 scale-105 z-10' 
                      : 'bg-white/80 border-transparent shadow-sm hover:bg-white hover:border-blue-200 backdrop-blur-sm'
                  }`}
                >
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 transition-colors ${isActive ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                    <SubIcon className="w-7 h-7" />
                  </div>
                  <span className={`font-bold text-center ${isActive ? 'text-blue-900' : 'text-slate-600'}`}>
                    {sub.title}
                  </span>
                </button>
              );
            })}
          </motion.div>
        )}

        {/* Content Area */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={displayData.title}
            {...animationProps}
            className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 md:p-12"
          >
            <div className="flex flex-col lg:flex-row gap-16 items-center">
              {/* Features List */}
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 text-indigo-700 font-semibold text-sm mb-8 border border-indigo-100">
                  <Sparkles className="w-4 h-4" />
                  {t('products.premiumBenefits')}
                </div>
                <h2 className="text-3xl font-bold text-slate-900 mb-8">{t('products.whyChoose', { title: displayData.title })}</h2>
                <div className="grid sm:grid-cols-2 gap-6">
                  {displayData.features?.map((feature, i) => (
                    <div key={i} className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-colors">
                      <div className="mt-1">
                        <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                      </div>
                      <p className="font-medium text-slate-700 leading-relaxed">{feature}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Call to Action Card */}
              <div className="w-full lg:w-[400px]">
                <div className="bg-gradient-to-b from-blue-50 to-white p-8 rounded-3xl border border-blue-100 text-center shadow-lg shadow-blue-900/5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full blur-2xl"></div>
                  
                  <span className="text-slate-500 font-semibold uppercase tracking-wider text-sm mb-2 block">{t('products.startingRate')}</span>
                  <div className="flex justify-center items-baseline gap-1 mb-8">
                    <span className="text-6xl font-black text-blue-600 tracking-tighter">{displayData.rate}</span>
                    <span className="text-slate-400 font-medium text-lg">{t('products.pa')}</span>
                  </div>
                  
                  <Link 
                    to={`/eligibility?type=${type}${currentProduct.isVehicle ? `&subType=${subType}` : ''}`} 
                    className="group relative flex items-center justify-center gap-3 w-full bg-blue-600 hover:bg-blue-700 text-white py-4 px-8 rounded-2xl font-bold text-lg transition-all shadow-xl shadow-blue-200 overflow-hidden"
                  >
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                    {t('products.checkEligibility')}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <p className="text-slate-400 text-sm mt-4 font-medium">{t('products.noImpact')}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Advisory Services Banner */}
        <div className="mt-16 bg-gradient-to-r from-emerald-900 to-emerald-700 rounded-[2.5rem] p-10 md:p-16 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/20 rounded-full blur-3xl translate-x-1/3 -translate-y-1/4"></div>
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-800 border border-emerald-600 text-emerald-200 font-bold text-sm mb-6">
                <Sparkles className="w-4 h-4" />
                Premium Coaching
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">Financial Advisory & Diagnosis</h2>
              <p className="text-emerald-100 text-lg leading-relaxed mb-8 max-w-2xl">
                Stop guessing why your loan was rejected. Get a professional diagnosis and a concrete strategy from an industry insider with over 25 years of experience.
              </p>
              <Link to="/advisory" className="inline-flex items-center gap-2 bg-white text-emerald-900 hover:bg-emerald-50 px-8 py-4 rounded-full font-bold transition-all shadow-xl">
                View Consulting Packages <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
            <div className="hidden md:flex w-48 h-48 bg-emerald-800 rounded-full items-center justify-center border-4 border-emerald-600/50 shadow-2xl shrink-0">
              <UserCircle className="w-24 h-24 text-emerald-300" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
