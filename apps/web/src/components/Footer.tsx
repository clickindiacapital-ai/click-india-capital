import { Link } from 'react-router-dom';
import { ShieldCheck, HeartHandshake, CheckCircle2, Headset, Loader2, Instagram } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { supabase } from '../utils/supabase';

export default function Footer() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setStatus('loading');
    const { error } = await supabase
      .from('subscribers')
      .insert([{ email }]);
      
    if (error) {
      console.error(error);
      setStatus('error');
    } else {
      setStatus('success');
      setEmail('');
    }
  };

  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 mt-auto">
      {/* Trust Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 bg-slate-800/50 rounded-3xl p-8 border border-slate-700">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            </div>
            <span className="font-medium text-white">{t('footer.trust.secure')}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
              <HeartHandshake className="w-6 h-6 text-blue-400" />
            </div>
            <span className="font-medium text-white">{t('footer.trust.partners')}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-6 h-6 text-indigo-400" />
            </div>
            <span className="font-medium text-white">{t('footer.trust.transparent')}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center flex-shrink-0">
              <Headset className="w-6 h-6 text-purple-400" />
            </div>
            <span className="font-medium text-white">{t('footer.trust.support')}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-8 mb-12 border-b border-slate-800 pb-12">
          
          <div className="md:col-span-12 lg:col-span-4">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <img src="/logo.png" alt="Click India Capital Logo" className="w-10 h-10 rounded-xl object-contain drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
              <span className="font-bold text-2xl text-white tracking-tight">Click India Capital</span>
            </Link>
            <p className="text-slate-400 leading-relaxed mb-6">
              {t('footer.about')}
            </p>
            <div className="flex items-center gap-4">
              <a 
                href="https://instagram.com/clickindiacapital" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-pink-600 hover:text-white text-slate-400 transition-all shadow-sm"
                aria-label="Follow us on Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div className="md:col-span-12 lg:col-span-7 lg:col-start-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-white font-semibold mb-4">{t('footer.quickLinks.title')}</h3>
                <ul className="space-y-3 text-sm sm:text-base">
                  <li><Link to="/" className="hover:text-blue-400 transition-colors">{t('footer.quickLinks.home')}</Link></li>
                  <li><Link to="/about" className="hover:text-blue-400 transition-colors">{t('footer.quickLinks.aboutUs')}</Link></li>
                  <li><Link to="/insights" className="hover:text-blue-400 transition-colors">{t('nav.insights')}</Link></li>
                  <li><Link to="/contact" className="hover:text-blue-400 transition-colors">{t('footer.quickLinks.contactUs')}</Link></li>
                </ul>
              </div>

              <div>
                <h3 className="text-white font-semibold mb-4">Newsletter</h3>
                <p className="text-sm text-slate-400 mb-4">Subscribe to our weekly financial insights and market updates.</p>
                <form className="flex flex-col gap-2" onSubmit={handleSubscribe}>
                  <input 
                    type="email" 
                    placeholder="Enter your email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={status === 'loading' || status === 'success'}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm disabled:opacity-50"
                  />
                  <button 
                    type="submit" 
                    disabled={status === 'loading' || status === 'success'}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors text-sm flex items-center justify-center disabled:bg-blue-800"
                  >
                    {status === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> : status === 'success' ? 'Subscribed!' : 'Subscribe'}
                  </button>
                  {status === 'error' && <p className="text-red-400 text-xs mt-1">Failed to subscribe. Please try again.</p>}
                  {status === 'success' && <p className="text-emerald-400 text-xs mt-1">Welcome to the newsletter!</p>}
                </form>
              </div>

              <div>
                <h3 className="text-white font-semibold mb-4">{t('footer.legal.title')}</h3>
                <ul className="space-y-3 text-sm sm:text-base">
                  <li><Link to="/privacy" className="hover:text-blue-400 transition-colors">{t('footer.legal.privacy')}</Link></li>
                  <li><Link to="/terms" className="hover:text-blue-400 transition-colors">{t('footer.legal.terms')}</Link></li>
                  <li><Link to="/disclaimer" className="hover:text-blue-400 transition-colors">{t('footer.legal.disclaimer')}</Link></li>
                  <li><Link to="/consent" className="hover:text-blue-400 transition-colors">{t('footer.legal.consent')}</Link></li>
                </ul>
              </div>

              <div className="col-span-2 md:col-span-1">
                <h3 className="text-white font-semibold mb-4">{t('footer.support.title')}</h3>
                <ul className="space-y-3 text-sm sm:text-base">
                  <li><Link to="/grievance" className="hover:text-blue-400 transition-colors">{t('footer.support.grievance')}</Link></li>
                  <li><Link to="/data-deletion" className="hover:text-blue-400 transition-colors">{t('footer.support.dataDeletion')}</Link></li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center text-slate-500 text-sm max-w-4xl mx-auto space-y-4">
          <p className="text-xs border-b border-slate-800 pb-4 mb-4">
            <strong>Disclaimer:</strong> Click India Capital is a loan facilitation, advisory, and comparison platform and does not directly provide loans, accept deposits, or make credit decisions. Loan approvals, interest rates, processing fees, loan amounts, and other terms are determined solely by the respective lending institutions and are subject to their policies and eligibility criteria. Submission of an application or utilizing our advisory services does not guarantee loan approval. We provide guidance to improve credit profiles, but we do not provide legal debt settlement services.
          </p>
          <p>{t('footer.copyright')}</p>
        </div>
      </div>
    </footer>
  );
}
