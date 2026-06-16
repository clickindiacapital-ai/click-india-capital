import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function WhatsAppWidget() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const phoneNumber = "919995959055";
  const defaultMessage = "Hi Click India Capital! I need some help regarding loan advisory.";

  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(defaultMessage)}`;

  useEffect(() => {
    // Show tooltip after 5 seconds to grab attention
    const timer = setTimeout(() => {
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 5000);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {showTooltip && !isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white text-slate-800 px-5 py-4 rounded-2xl shadow-xl mb-3 border border-slate-100 relative w-[250px]"
          >
            <p className="font-bold text-sm mb-1">Need Expert Guidance?</p>
            <p className="text-xs text-slate-500 mb-3">Get personalized assistance directly from the founder.</p>
            <button 
              onClick={() => window.open(whatsappUrl, '_blank')}
              className="w-full py-2 bg-[#25D366] text-white text-xs font-bold rounded-lg hover:bg-[#20bd5a] transition-colors"
            >
              Chat with Sameer
            </button>
            <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white border-b border-r border-slate-100 transform rotate-45"></div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => window.open(whatsappUrl, '_blank')}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="w-14 h-14 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-2xl shadow-green-500/30 hover:bg-[#20bd5a] transition-colors relative"
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle className="w-8 h-8" />
        <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 border-2 border-white rounded-full animate-pulse"></span>
      </motion.button>
    </div>
  );
}
