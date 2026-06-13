import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { submitToWeb3Forms } from '../utils/web3forms';

type Message = {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  options?: { id: string; label: string }[];
  isTyping?: boolean;
};

export default function ChatBot() {
  const { t } = useTranslation();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(location.pathname === '/assistant');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [step, setStep] = useState(0);
  const [leadData, setLeadData] = useState<Record<string, string>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-open if navigating to /assistant
  useEffect(() => {
    if (location.pathname === '/assistant') {
      setIsOpen(true);
    }
  }, [location.pathname]);

  // Initialize chat when opened for the first time
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      addBotMessage(t('chatbot.greeting'), [
        { id: 'Vehicle Loan', label: t('chatbot.options.vehicle') },
        { id: 'Personal Loan', label: t('chatbot.options.personal') },
        { id: 'Home Loan', label: t('chatbot.options.home') },
        { id: 'Business Loan', label: t('chatbot.options.business') },
      ]);
      setStep(1);
    }
  }, [isOpen]);

  // Auto scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const addBotMessage = (text: string, options?: { id: string; label: string }[]) => {
    const id = Date.now().toString();
    setMessages(prev => [...prev, { id, sender: 'bot', text, isTyping: true }]);
    
    setTimeout(() => {
      setMessages(prev => prev.map(msg => 
        msg.id === id ? { ...msg, isTyping: false, options } : msg
      ));
    }, 1000);
  };

  const addUserMessage = (text: string) => {
    setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'user', text }]);
  };

  const handleOptionClick = (optionId: string, optionLabel: string) => {
    addUserMessage(optionLabel);
    processNextStep(optionId);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    
    addUserMessage(inputValue);
    const value = inputValue;
    setInputValue('');
    processNextStep(value);
  };

  const processNextStep = async (value: string) => {
    const newData = { ...leadData };

    if (step === 1) {
      newData.loanType = value;
      setLeadData(newData);
      addBotMessage(t('chatbot.q_employment'), [
        { id: 'Salaried', label: t('chatbot.options.salaried') },
        { id: 'Self-Employed', label: t('chatbot.options.selfEmployed') },
      ]);
      setStep(2);
    } 
    else if (step === 2) {
      newData.employment = value;
      setLeadData(newData);
      addBotMessage(t('chatbot.q_salary'));
      setStep(3);
    }
    else if (step === 3) {
      newData.salary = value;
      setLeadData(newData);
      addBotMessage(t('chatbot.q_name'));
      setStep(4);
    }
    else if (step === 4) {
      newData.name = value;
      setLeadData(newData);
      addBotMessage(t('chatbot.q_phone'));
      setStep(5);
    }
    else if (step === 5) {
      newData.phone = value;
      setLeadData(newData);
      
      // Submit lead to Web3Forms
      addBotMessage("Processing your details...");
      setStep(6); // Prevent further input while loading
      
      const result = await submitToWeb3Forms(newData, "Chat Assistant Lead");
      
      if (result.success) {
        addBotMessage(t('chatbot.success'));
      } else {
        addBotMessage(`There was an issue sending the email. Reason: ${result.message}`);
      }
    }
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-14 h-14 sm:w-16 sm:h-16 bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center z-50 hover:bg-blue-700 transition-colors ${isOpen ? 'hidden' : 'flex'}`}
      >
        <MessageSquare className="w-7 h-7 sm:w-8 sm:h-8" />
        <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 border-2 border-white rounded-full animate-pulse"></span>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-[calc(100vw-2rem)] sm:w-[380px] h-[calc(100dvh-6rem)] sm:h-[600px] max-h-[80vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col z-50 border border-slate-200"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-700 to-blue-600 p-4 flex justify-between items-center text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold">{t('chatbot.title')}</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    <span className="text-xs text-blue-100">Online</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 bg-slate-50">
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl p-3 ${msg.sender === 'user' ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-white text-slate-800 shadow-sm border border-slate-100 rounded-tl-sm'}`}>
                      {msg.isTyping ? (
                        <div className="flex gap-1 py-1 px-2">
                          <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce"></span>
                          <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                          <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                        </div>
                      ) : (
                        <>
                          <p className="text-sm leading-relaxed">{msg.text}</p>
                          {msg.options && (
                            <div className="mt-3 flex flex-col gap-2">
                              {msg.options.map(opt => (
                                <button
                                  key={opt.id}
                                  onClick={() => handleOptionClick(opt.id, opt.label)}
                                  className="text-sm py-2 px-4 rounded-xl border border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-600 hover:text-white transition-colors text-left"
                                >
                                  {opt.label}
                                </button>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-slate-100">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={t('chatbot.placeholder')}
                  disabled={step === 6}
                  className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm disabled:opacity-50"
                />
                <button 
                  type="submit"
                  disabled={!inputValue.trim() || step === 6}
                  className="w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white flex justify-center items-center rounded-xl transition-colors disabled:opacity-50"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
