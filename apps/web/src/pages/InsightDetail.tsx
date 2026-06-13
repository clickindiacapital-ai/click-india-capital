import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Calendar, Loader2, AlertCircle, Send, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

import { submitToWeb3Forms } from '../utils/web3forms';

interface Article {
  id: number;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  link?: string;
  image: string;
}

export default function InsightDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { data: articles, isQueryLoading, isError } = useQuery<Article[]>({
    queryKey: ['insights'],
    queryFn: async () => {
      const response = await fetch('/insights.json');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    }
  });

  const article = articles?.find(a => a.id === Number(id));

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsLoading(true);
    const success = await submitToWeb3Forms({ email, article: article?.title }, "Newsletter Subscription");
    setIsLoading(false);
    
    if (success) {
      setIsSubscribed(true);
      setEmail('');

      // Automatically navigate to the original article after a short delay
      setTimeout(() => {
        if (article?.link) {
          window.open(article.link, '_blank', 'noopener,noreferrer');
        }
      }, 1500); // 1.5 seconds delay to let them see the success message
    } else {
      alert("Failed to subscribe. Please try again later.");
    }
  };

  if (isQueryLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center py-20 text-slate-500">
        <Loader2 className="w-10 h-10 animate-spin mb-4 text-blue-500" />
        <p>Loading insight...</p>
      </div>
    );
  }

  if (isError || !article) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center py-20 text-red-500">
        <AlertCircle className="w-10 h-10 mb-4" />
        <p>Article not found or failed to load.</p>
        <button 
          onClick={() => navigate('/insights')}
          className="mt-6 text-blue-600 hover:underline flex items-center"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Insights
        </button>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <button 
          onClick={() => navigate('/insights')}
          className="text-slate-500 hover:text-blue-600 transition-colors flex items-center mb-8 font-medium"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to all insights
        </button>

        <motion.article 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200"
        >
          <div className="h-64 sm:h-96 w-full relative">
            <img 
              src={article.image} 
              alt={article.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-bold text-slate-800 uppercase tracking-wider shadow-sm">
              {article.category}
            </div>
          </div>

          <div className="p-8 sm:p-12">
            <div className="flex items-center text-slate-500 mb-6 gap-2 font-medium">
              <Calendar className="w-5 h-5" />
              {article.date}
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-8 leading-tight">
              {article.title}
            </h1>
            
            <div className="text-lg text-slate-700 leading-relaxed mb-12 border-l-4 border-blue-500 pl-6 italic">
              {article.excerpt}
            </div>

            {/* Newsletter Subscription Box */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 sm:p-10 text-white shadow-xl relative overflow-hidden mb-12">
              <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
              <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
              
              <div className="relative z-10 text-center max-w-2xl mx-auto">
                <h3 className="text-2xl sm:text-3xl font-bold mb-4">Want full access to daily market insights?</h3>
                <p className="text-slate-300 mb-8">
                  Subscribe to our exclusive newsletter and get the latest banking trends, loan updates, and financial strategies delivered straight to your inbox.
                </p>
                
                {isSubscribed ? (
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-emerald-500/20 border border-emerald-500 text-emerald-300 p-4 rounded-xl font-medium"
                  >
                    🎉 Thank you for subscribing! Keep an eye on your inbox.
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
                    <input 
                      type="email" 
                      placeholder="Enter your email address" 
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="flex-1 px-6 py-4 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button 
                      type="submit"
                      disabled={isLoading}
                      className="px-8 py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-400 text-white font-bold rounded-xl transition-colors flex items-center justify-center whitespace-nowrap shadow-lg shadow-blue-600/30"
                    >
                      {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Subscribe <Send className="w-4 h-4 ml-2" /></>}
                    </button>
                  </form>
                )}
                <p className="text-xs text-slate-400 mt-4">We respect your privacy. No spam, ever.</p>
              </div>
            </div>

          </div>
        </motion.article>
      </div>
    </div>
  );
}
