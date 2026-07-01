import { Link } from 'react-router-dom';
import { ArrowRight, MessageSquare, Sparkles } from 'lucide-react';

export default function Megafoot() {
  const handleWhatsAppChat = () => {
    const phone = '919876543210';
    const greeting = 'Hello, I saw the Click India Capital website and would like to consult on my loan options.';
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(greeting)}`, '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 mt-16">
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/25 p-8 md:p-12 shadow-2xl">
        {/* Background glow flares */}
        <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-blue-600/10 blur-[80px] pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-purple-600/10 blur-[80px] pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8 text-center lg:text-left">
          <div className="max-w-2xl space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles size={12} /> Ready to fund your next move?
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              Get an indicative loan readiness check in 2 minutes
            </h2>
            <p className="text-slate-400 text-sm md:text-base">
              Check eligibility for Home, Personal, Business, or Vehicle loans completely free with zero credit score impact.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto shrink-0 justify-center">
            <Link 
              to="/v2"
              className="px-6 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm uppercase tracking-wider transition-all shadow-lg shadow-blue-950/40 flex items-center justify-center gap-2 group"
            >
              <span>Get My Match</span>
              <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <button 
              onClick={handleWhatsAppChat}
              className="px-6 py-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.06] text-white font-bold text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2"
            >
              <MessageSquare size={16} className="text-emerald-400" />
              <span>Consult on WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
