import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Sparkles, MessageSquare, ArrowRight, UserCheck } from 'lucide-react';

export default function ComingSoon() {
  const handleWhatsAppChat = () => {
    // Standard direct wa.me link to Advisory Team
    const phone = '919876543210'; // Advisory contact number
    const greeting = 'Hello, I saw that Click India Capital is launching soon. I would like to get in touch for a loan consultation.';
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(greeting)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col items-center justify-center relative overflow-hidden px-6 py-12">
      {/* Background radial glowing effects */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Main card */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-xl w-full text-center space-y-8 backdrop-blur-md bg-white/[0.02] border border-white/5 p-10 md:p-12 rounded-[32px] shadow-2xl relative z-10"
      >
        {/* Logo and badge */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-blue-600/15 border border-blue-500/35 flex items-center justify-center text-blue-400 shadow-lg shadow-blue-500/5">
            <Shield size={28} />
          </div>
          <motion.span 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-[10px] font-bold uppercase tracking-widest border border-blue-500/20"
          >
            ✓ Coming Soon
          </motion.span>
        </div>

        {/* Title */}
        <div className="space-y-3">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
            Click India <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">Capital</span>
          </h1>
          <p className="text-slate-400 text-sm md:text-base leading-relaxed">
            Our next-generation, database-driven loan matchmaking and professional debt advisory platform is preparing for launch.
          </p>
        </div>

        {/* Highlights */}
        <div className="grid grid-cols-2 gap-4 text-left pt-2">
          <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/[0.03]">
            <Sparkles className="text-indigo-400 mb-2" size={16} />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Lender Matchmaking</h4>
            <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">Dynamic credit policy matching for 20+ banks & NBFCs.</p>
          </div>
          <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/[0.03]">
            <UserCheck className="text-emerald-400 mb-2" size={16} />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Advisory Driven</h4>
            <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">Analyze and repair credit health scores before submitting.</p>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2 flex flex-col gap-3">
          <button 
            onClick={handleWhatsAppChat}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl text-xs font-bold tracking-wider uppercase transition-all shadow-xl shadow-blue-900/30 flex items-center justify-center gap-2 group"
          >
            <MessageSquare size={16} />
            <span>Consult on WhatsApp</span>
            <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">
            Direct Expert Consultation • Zero Cost Advisory
          </span>
        </div>
      </motion.div>

      {/* Footer */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-8 text-center text-[10px] text-slate-600 uppercase tracking-widest relative z-10"
      >
        © {new Date().getFullYear()} Click India Capital. All rights reserved.
      </motion.div>
    </div>
  );
}
