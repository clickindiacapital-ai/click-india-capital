import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, Loader2, Maximize2, Minimize2 } from 'lucide-react';

interface AIChatAssistantProps {
  contextData?: any; // The current customer profile or screen context
}

export default function AIChatAssistant({ contextData }: AIChatAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([
    { role: 'assistant', content: 'Hello! I am your OS Intelligence Agent. How can I assist you with this profile today?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsTyping(true);

    // Mock AI Response generation based on user intent
    setTimeout(() => {
      let response = '';
      const lowerInput = userMessage.toLowerCase();

      if (lowerInput.includes('summarize')) {
        if (contextData) {
          response = `**Customer Summary:**\n${contextData.name} is a ${contextData.employment_type || 'professional'} working at ${contextData.employer_name || 'their company'}. They have a monthly income of ₹${(contextData.monthly_income || 0).toLocaleString()} with an EMI burden of ₹${(contextData.emi_obligations || 0).toLocaleString()}.\n\nTheir primary goal is to **${contextData.primary_goal || 'secure a loan'}**. They currently have ${contextData.existing_loans_count || 0} active loans.`;
        } else {
          response = "I don't have a specific customer profile open to summarize right now.";
        }
      } else if (lowerInput.includes('rejection') || lowerInput.includes('rejected')) {
        response = `Based on standard risk models, common rejection reasons for a profile with a ${contextData?.credit_score || 'similar'} credit score and ₹${(contextData?.emi_obligations || 0).toLocaleString()} existing EMI include:\n\n1. **High FOIR (Fixed Obligation to Income Ratio)**\n2. **Recent delinquencies** in credit history\n\nI suggest requesting a 6-month bank statement to verify actual cash flow before submitting to another lender.`;
      } else if (lowerInput.includes('lender') || lowerInput.includes('suggest')) {
        response = "Given the profile metrics, I would recommend:\n- **HDFC Bank** for lowest rates if documentation is perfect.\n- **Bajaj Finserv** if speed is a priority and FOIR is slightly high.\n- **Incred** if they have a non-standard employment profile.";
      } else if (lowerInput.includes('blueprint')) {
        response = `### Loan Strategy Blueprint\n\n**Client:** ${contextData?.name || 'Unknown'}\n**Target:** ₹10,00,000 Personal Loan\n\n**Strategy Steps:**\n1. Clear the outstanding credit card balance of ₹${(contextData?.credit_card_outstanding || 0).toLocaleString()} to improve FOIR.\n2. Wait 30 days for the CIBIL score to reflect the payment.\n3. Apply via private banks first for better ROI.\n\n*Would you like me to save this to their consultation notes?*`;
      } else {
        response = "I can analyze this profile, generate a loan blueprint, explain potential rejection reasons, or suggest alternative lenders. Just ask!";
      }

      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
      setIsTyping(false);
    }, 1500);
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-slate-900 text-white rounded-full shadow-2xl shadow-blue-900/50 flex items-center justify-center hover:scale-105 hover:bg-blue-600 transition-all z-50 group"
      >
        <Bot size={24} />
        {/* Tooltip */}
        <span className="absolute right-16 bg-slate-800 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-medium pointer-events-none">
          Ask OS Intelligence
        </span>
      </button>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col z-50 overflow-hidden transition-all duration-300 ${isExpanded ? 'w-[600px] h-[800px] right-1/2 translate-x-1/2 bottom-1/2 translate-y-1/2' : 'w-[400px] h-[600px]'}`}>
      
      {/* Header */}
      <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
            <Bot size={18} />
          </div>
          <div>
            <h3 className="font-bold text-sm">OS Intelligence Agent</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              {contextData ? `Analyzing: ${contextData.name}` : 'Global Context'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white"
          >
            {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl p-4 text-sm shadow-sm ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-sm' 
                : 'bg-white border border-slate-200 text-slate-700 rounded-tl-sm'
            }`}>
              {msg.role === 'assistant' && (
                <div className="flex items-center gap-2 mb-2 text-blue-600">
                  <Bot size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">OS AI</span>
                </div>
              )}
              {/* Parse rudimentary markdown like bolding for display */}
              <div 
                className="whitespace-pre-wrap leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: msg.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                }}
              />
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm p-4 shadow-sm flex items-center gap-2">
              <Loader2 size={16} className="animate-spin text-blue-500" />
              <span className="text-xs text-slate-500 font-medium">Analyzing profile...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-200 shrink-0">
        <div className="flex gap-2">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about this profile, request summaries, or blueprints..."
            className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm shrink-0"
          >
            <Send size={18} className="ml-1" />
          </button>
        </div>
      </div>

    </div>
  );
}
