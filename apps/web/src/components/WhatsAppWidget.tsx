import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../utils/supabaseClient';
import { generateUUID } from '../utils/uuid';

export default function WhatsAppWidget() {
  const { t } = useTranslation();
  const [showTooltip, setShowTooltip] = useState(false);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadName, setLeadName] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const whatsappUrl = `https://topmate.io/clickindiacapital/2155338`;

  useEffect(() => {
    // Check if dismissed in last 24 hours
    const dismissed = localStorage.getItem('whatsapp_tooltip_dismissed');
    if (dismissed && Date.now() - parseInt(dismissed) < 24 * 60 * 60 * 1000) {
      return;
    }

    // Show tooltip after 8 seconds to grab attention
    const timer = setTimeout(() => {
      setShowTooltip(true);
    }, 8000);
    return () => clearTimeout(timer);
  }, []);

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadName.trim() || !leadPhone.trim()) return;

    setIsSubmitting(true);
    const customerId = generateUUID();

    try {
      // 1. Insert into Supabase customers using client-generated UUID
      const { error: customerError } = await supabase
        .from('customers')
        .insert([{
          id: customerId,
          name: leadName,
          phone: leadPhone,
          whatsapp: leadPhone,
          primary_goal: 'Founder Consultation Lead'
        }]);

      if (!customerError) {
        // 2. Insert into Supabase leads linking the customerId
        await supabase.from('leads').insert([{
          customer_id: customerId,
          name: leadName,
          phone: leadPhone,
          loan_type: 'Advisory',
          status: 'NEW',
          source: 'Website WhatsApp Widget',
          urgent_action_required: false
        }]);
      } else {
        console.error('Customer insert error:', customerError);
      }
    } catch (err) {
      console.error('Error saving WhatsApp lead to CRM:', err);
    } finally {
      setIsSubmitting(false);
      setShowLeadForm(false);
      setShowTooltip(false);
      
      // Save dismissed state so they aren't bugged again during this session
      localStorage.setItem('whatsapp_tooltip_dismissed', Date.now().toString());
      
      // Open WhatsApp/Topmate URL in new tab
      window.open(whatsappUrl, '_blank');
      
      // Reset form
      setLeadName('');
      setLeadPhone('');
    }
  };

  const handleCloseTooltip = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowTooltip(false);
    setShowLeadForm(false);
    localStorage.setItem('whatsapp_tooltip_dismissed', Date.now().toString());
  };

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col items-start select-none">
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white text-slate-800 px-5 py-4 rounded-2xl shadow-xl mb-3 border border-slate-100 relative w-[260px]"
          >
            {/* Close button */}
            <button
              onClick={handleCloseTooltip}
              className="absolute top-2.5 right-2.5 text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-100 transition-colors"
              aria-label="Dismiss tooltip"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            {!showLeadForm ? (
              <>
                <p className="font-bold text-sm mb-1 pr-4">Need Expert Guidance?</p>
                <p className="text-xs text-slate-500 mb-3">Get personalized assistance directly from the founder.</p>
                <button 
                  onClick={() => setShowLeadForm(true)}
                  className="w-full py-2 bg-[#25D366] text-white text-xs font-bold rounded-lg hover:bg-[#20bd5a] transition-colors"
                >
                  Chat with Sameer
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => setShowLeadForm(false)}
                  className="text-slate-400 hover:text-slate-600 text-[10px] font-bold uppercase tracking-wider mb-2 flex items-center gap-0.5 transition-colors"
                >
                  ← Back
                </button>
                <form onSubmit={handleLeadSubmit} className="flex flex-col gap-2.5">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Your Name</label>
                    <input 
                      type="text" 
                      required
                      value={leadName}
                      onChange={(e) => setLeadName(e.target.value)}
                      placeholder="Enter your name" 
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#25D366] focus:border-[#25D366]"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">WhatsApp Number</label>
                    <input 
                      type="tel" 
                      required
                      value={leadPhone}
                      onChange={(e) => setLeadPhone(e.target.value)}
                      placeholder="Enter mobile number" 
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#25D366] focus:border-[#25D366]"
                    />
                  </div>
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2 bg-[#25D366] text-white text-xs font-bold rounded-lg hover:bg-[#20bd5a] transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Saving details...' : 'Proceed to Chat'}
                  </button>
                </form>
              </>
            )}
            {/* Tooltip pointer */}
            <div className="absolute -bottom-2 left-6 w-4 h-4 bg-white border-b border-r border-slate-100 transform rotate-45"></div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        animate={{
          scale: [1, 1.04, 1],
          boxShadow: [
            "0 10px 25px -5px rgba(37, 211, 102, 0.3)",
            "0 10px 35px 0px rgba(37, 211, 102, 0.6)",
            "0 10px 25px -5px rgba(37, 211, 102, 0.3)"
          ]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => {
          setShowTooltip(true);
          setShowLeadForm(true);
        }}
        className="w-14 h-14 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-2xl hover:bg-[#20bd5a] transition-colors relative"
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle className="w-8 h-8" />
        <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 border-2 border-white rounded-full animate-pulse"></span>
      </motion.button>
    </div>
  );
}

