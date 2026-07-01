import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
}

interface AccordionFaqProps {
  faqs: FaqItem[];
}

export default function AccordionFaq({ faqs }: AccordionFaqProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleIndex = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      {faqs.map((faq, i) => {
        const isOpen = openIndex === i;
        return (
          <div 
            key={i} 
            className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden transition-all duration-200"
          >
            <button
              onClick={() => toggleIndex(i)}
              className="w-full px-6 py-5 flex items-center justify-between text-left font-bold text-slate-900 hover:text-blue-600 transition-colors"
            >
              <span className="text-sm md:text-base pr-4">{faq.question}</span>
              <ChevronDown 
                size={18} 
                className={`text-slate-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-blue-500' : ''}`}
              />
            </button>
            
            {/* Collapsible Answer */}
            <div 
              className={`transition-all duration-200 ease-in-out overflow-hidden ${isOpen ? 'max-h-60 opacity-100 border-t border-slate-100' : 'max-h-0 opacity-0'}`}
            >
              <div className="px-6 py-5 text-sm md:text-base text-slate-600 leading-relaxed bg-slate-50/50">
                {faq.answer}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
