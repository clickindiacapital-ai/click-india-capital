import { IndianRupee } from 'lucide-react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSelector from './LanguageSelector';
import Footer from './Footer';

export default function Layout() {
  const location = useLocation();
  const isHome = location.pathname === '/';
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <nav className={`fixed w-full z-50 transition-colors duration-300 border-b ${isHome ? 'bg-white/80 backdrop-blur-md border-slate-100' : 'bg-white border-slate-200 shadow-sm'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link to="/" className="flex items-center gap-2">
              <img src="/logo.png" alt="Click India Capital Logo" className="w-10 h-10 rounded-xl object-contain drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
              <span className="font-bold text-2xl text-slate-900 tracking-tight">Click India Capital</span>
            </Link>
            <div className="hidden md:flex gap-8 items-center">
              <Link to="/" className="text-slate-600 hover:text-blue-600 font-medium transition-colors">{t('nav.home')}</Link>
              
              {/* Products Dropdown */}
              <div className="relative group py-6 -my-6">
                <button className="text-slate-600 hover:text-blue-600 font-medium transition-colors flex items-center gap-1 h-full cursor-pointer">
                  {t('nav.productsAndServices')}
                  <svg className="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="absolute top-full left-0 w-56 bg-white border border-slate-100 rounded-2xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top -translate-y-2 group-hover:translate-y-0 z-50">
                  <div className="p-2 flex flex-col gap-1">
                    <Link to="/products?type=vehicle" className="block px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700 rounded-xl transition-colors">{t('nav.vehicleLoans')}</Link>
                    <Link to="/products?type=personal" className="block px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700 rounded-xl transition-colors">{t('nav.personalLoans')}</Link>
                    <Link to="/products?type=business" className="block px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700 rounded-xl transition-colors">{t('nav.businessLoans')}</Link>
                    <Link to="/products?type=home" className="block px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700 rounded-xl transition-colors">{t('nav.homeLoans')}</Link>
                  </div>
                </div>
              </div>
              <LanguageSelector />
              <Link to="/eligibility" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-full font-medium transition-all shadow-lg shadow-blue-200">
                {t('nav.applyNow')}
              </Link>
            </div>
          </div>
        </div>
      </nav>
      <main className="flex-1 pt-20">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
