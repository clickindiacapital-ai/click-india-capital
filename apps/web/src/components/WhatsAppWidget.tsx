import { MessageCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function WhatsAppWidget() {
  const { t } = useTranslation();
  
  // Replace this with your exact WhatsApp number (include country code, no +)
  const phoneNumber = "919995959055";
  const message = "Hi Click India Capital, I am interested in getting a loan. Please help me check my eligibility.";
  
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <a 
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-4 left-4 sm:bottom-6 sm:left-6 w-14 h-14 sm:w-16 sm:h-16 bg-[#25D366] text-white rounded-full shadow-2xl flex items-center justify-center cursor-pointer hover:scale-110 transition-transform z-40 group"
      aria-label="Chat on WhatsApp"
    >
      <div className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20"></div>
      <MessageCircle className="w-8 h-8" />
      
      {/* Tooltip */}
      <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 bg-white text-slate-800 px-4 py-2 rounded-xl shadow-xl font-bold whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all pointer-events-none border border-slate-100">
        Chat with us!
        <div className="absolute top-1/2 -translate-y-1/2 right-full border-8 border-transparent border-r-white"></div>
      </div>
    </a>
  );
}
