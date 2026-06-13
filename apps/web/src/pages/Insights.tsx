import { HelpCircle, Newspaper, ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  published_at: string;
}

export default function Insights() {
  const { t } = useTranslation();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loadingNews, setLoadingNews] = useState(true);

  useEffect(() => {
    async function fetchNews() {
      const { data, error } = await supabase
        .from('daily_insights')
        .select('*')
        .order('published_at', { ascending: false })
        .limit(6);
      
      if (!error && data) {
        setNews(data);
      }
      setLoadingNews(false);
    }
    fetchNews();
  }, []);

  const faqs = [
    {
      question: "What is the minimum CIBIL score required for a Personal Loan?",
      answer: "Generally, a CIBIL score of 750 or above is considered excellent for a personal loan. However, Click India Capital works with over 50+ lending partners, allowing us to secure loans for individuals with scores starting from 650, depending on their income and employment stability."
    },
    {
      question: "How long does it take to get a Business Loan approved in India?",
      answer: "Through Click India Capital's digital lending process, business loans can be approved in as little as 48 hours. The disbursement usually happens within 3 to 5 working days after the submission of minimal KYC and GST documents."
    },
    {
      question: "What are the eligibility criteria for a Home Loan?",
      answer: "To be eligible for a home loan, you must be between 21 and 65 years old. Salaried applicants need a minimum monthly income of ₹25,000, while self-employed individuals need a stable business vintage of at least 3 years with filed ITRs."
    },
    {
      question: "Do you offer loans with zero processing fees?",
      answer: "Processing fees vary depending on the specific bank or NBFC providing the loan. However, Click India Capital frequently negotiates exclusive waivers and reduced processing fees for our clients during festive seasons and special campaigns."
    },
    {
      question: "Can I pre-close my loan before the tenure ends?",
      answer: "Yes, most of our lending partners allow foreclosure after a lock-in period of 6 to 12 months. Foreclosure charges typically range from 2% to 4% of the outstanding principal amount, depending on the lender's specific terms."
    },
    {
      question: "Why should I use an agency instead of going directly to a bank?",
      answer: "When you go to a single bank, you only get their specific rate. At Click India Capital, we compare offers from 50+ banks and NBFCs simultaneously. We do the heavy lifting of negotiation, document processing, and ensuring you get the absolute lowest interest rate available in the market."
    }
  ];

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Hero Section */}
      <section className="bg-white py-16 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <HelpCircle className="w-8 h-8" />
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
              Knowledge Base
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Everything you need to know about securing the best loans in India.
            </p>
          </motion.div>
        </div>
      </section>

      {/* FAQ Grid */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
              >
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 flex items-start gap-3">
                  <span className="text-emerald-500 font-black">Q.</span>
                  {faq.question}
                </h3>
                <p className="text-slate-600 leading-relaxed text-lg flex items-start gap-3">
                  <span className="text-slate-300 font-black">A.</span>
                  {faq.answer}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Financial News Feed */}
      <section className="py-16 bg-slate-100 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
              <Newspaper className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-slate-900">Latest Market News</h2>
              <p className="text-slate-600">Automated daily feed from top financial publications.</p>
            </div>
          </div>

          {loadingNews ? (
            <div className="animate-pulse flex gap-6 overflow-hidden">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white h-48 w-full md:w-1/3 rounded-2xl"></div>
              ))}
            </div>
          ) : news.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl text-center text-slate-500 shadow-sm border border-slate-100">
              The automated news engine is currently gathering today's top stories. Check back tomorrow at 6:00 AM!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {news.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl transition-all flex flex-col h-full"
                >
                  <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">
                    {item.source}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-3 line-clamp-2">
                    {item.title}
                  </h3>
                  <p className="text-slate-600 text-sm mb-6 line-clamp-3 flex-1">
                    {item.summary}
                  </p>
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
                    <span className="text-xs text-slate-400 font-medium">
                      {new Date(item.published_at).toLocaleDateString()}
                    </span>
                    <a 
                      href={item.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center text-blue-600 font-bold text-sm hover:text-blue-800 transition-colors"
                    >
                      Read Source <ExternalLink className="w-4 h-4 ml-1" />
                    </a>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
