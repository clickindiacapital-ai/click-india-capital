import { useState, useEffect } from 'react';
import { IndianRupee, Menu, X } from 'lucide-react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSelector from './LanguageSelector';
import Footer from './Footer';
import ChatBot from './ChatBot';
import WhatsAppWidget from './WhatsAppWidget';
import { supabase } from '../utils/supabaseClient';

export default function Layout() {
  const location = useLocation();
  const isHome = location.pathname === '/';
  const { t } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setHasSession(!!session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setHasSession(!!session);
    });
    return () => subscription.unsubscribe();
  }, []);
  
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative">
      <nav className={`fixed w-full z-40 transition-colors duration-300 border-b ${isHome ? 'bg-white/80 backdrop-blur-md border-slate-100' : 'bg-white border-slate-200 shadow-sm'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link to="/" className="flex items-center gap-2">
              <img src="/logo.png" alt="Click India Capital Logo" className="w-10 h-10 rounded-xl object-contain drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
              <span className="font-bold text-2xl text-slate-900 tracking-tight">Click India Capital</span>
            </Link>
            <div className="hidden md:flex gap-8 items-center">
              <Link to="/" className="text-slate-600 hover:text-blue-600 font-medium transition-colors">{t('nav.home')}</Link>
              <Link to="/about" className="text-slate-600 hover:text-blue-600 font-medium transition-colors">{t('nav.aboutUs')}</Link>
              <Link to="/insights" className="text-slate-600 hover:text-blue-600 font-medium transition-colors">{t('nav.insights')}</Link>
              <Link to="/contact" className="text-slate-600 hover:text-blue-600 font-medium transition-colors">{t('nav.contactUs')}</Link>
              
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
                    <div className="h-px bg-slate-100 my-1"></div>
                    <Link to="/advisory" className="block px-4 py-2.5 text-sm font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors">{t('nav.advisory')}</Link>
                  </div>
                </div>
              </div>
              <LanguageSelector />
              <Link to="/eligibility" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-full font-medium transition-all shadow-lg shadow-blue-200">
                {t('nav.applyNow')}
              </Link>
            </div>
            
            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-4">
              <LanguageSelector />
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-slate-600 hover:text-blue-600 focus:outline-none"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 shadow-lg absolute w-full">
            <div className="px-4 pt-2 pb-6 flex flex-col gap-4">
              <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="text-slate-700 font-medium py-2 border-b border-slate-50">{t('nav.home')}</Link>
              <Link to="/about" onClick={() => setIsMobileMenuOpen(false)} className="text-slate-700 font-medium py-2 border-b border-slate-50">{t('nav.aboutUs')}</Link>
              <Link to="/insights" onClick={() => setIsMobileMenuOpen(false)} className="text-slate-700 font-medium py-2 border-b border-slate-50">{t('nav.insights')}</Link>
              <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)} className="text-slate-700 font-medium py-2 border-b border-slate-50">{t('nav.contactUs')}</Link>
              
              <div className="py-2 border-b border-slate-50">
                <span className="text-slate-900 font-bold mb-2 block">{t('nav.productsAndServices')}</span>
                <div className="flex flex-col gap-3 pl-4">
                  <Link to="/products?type=vehicle" onClick={() => setIsMobileMenuOpen(false)} className="text-slate-600">{t('nav.vehicleLoans')}</Link>
                  <Link to="/products?type=personal" onClick={() => setIsMobileMenuOpen(false)} className="text-slate-600">{t('nav.personalLoans')}</Link>
                  <Link to="/products?type=business" onClick={() => setIsMobileMenuOpen(false)} className="text-slate-600">{t('nav.businessLoans')}</Link>
                  <Link to="/products?type=home" onClick={() => setIsMobileMenuOpen(false)} className="text-slate-600">{t('nav.homeLoans')}</Link>
                  <div className="h-px bg-slate-100 my-1 w-full"></div>
                  <Link to="/advisory" onClick={() => setIsMobileMenuOpen(false)} className="text-emerald-600 font-bold">{t('nav.advisory')}</Link>
                </div>
              </div>
              
              <Link to="/eligibility" onClick={() => setIsMobileMenuOpen(false)} className="bg-blue-600 text-center text-white px-6 py-3 rounded-xl font-medium mt-2 shadow-md">
                {t('nav.applyNow')}
              </Link>
            </div>
          </div>
        )}
      </nav>
      <main className="flex-1 pt-20">
        <Outlet />
      </main>
      <Footer />
      <ChatBot />
      <WhatsAppWidget />
    </div>
  );
}
