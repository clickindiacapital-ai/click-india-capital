import { HelpCircle, BookOpen, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Insights() {
  const articles = [
    {
      title: "Why loans really get rejected (and how to fix it)",
      summary: "Understand the hidden reasons behind loan rejections and the exact steps you need to take before reapplying to ensure success.",
      category: "Rejection Diagnosis"
    },
    {
      title: "FOIR Explained: The golden rule of lending",
      summary: "Fixed Obligation to Income Ratio is the most critical metric banks use. Learn how to calculate yours and keep it in the safe zone.",
      category: "Eligibility"
    },
    {
      title: "How to strategically improve a low credit score",
      summary: "A practical, timeline-based approach to raising your CIBIL score from 650 to 750+ within 6 months.",
      category: "Credit Health"
    },
    {
      title: "The hidden truth about 'Zero Processing Fee'",
      summary: "Are zero processing fee loans actually cheaper? We break down the math between upfront fees and inflated interest rates.",
      category: "Loan Myths"
    },
    {
      title: "Fixed vs Floating Interest Rates in 2026",
      summary: "A data-driven analysis of whether you should lock in your interest rate or float with the current repo rate cycle.",
      category: "Strategy"
    },
    {
      title: "When is the absolute best time to buy a vehicle?",
      summary: "Dealership quotas, festive seasons, and depreciation: how to time your car loan application for the maximum discount.",
      category: "Vehicle Finance"
    }
  ];

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Hero Section */}
      <section className="bg-slate-900 text-white py-20 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-16 h-16 bg-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-8 h-8" />
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
              Founder-Led Insights
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Skip the generic news. Get actionable loan strategies, insider secrets, and credit health advice straight from a lending veteran.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white p-8 rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col h-full group cursor-pointer"
              >
                <div className="text-xs font-black text-blue-600 uppercase tracking-widest mb-4">
                  {item.category}
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 mb-4 group-hover:text-blue-600 transition-colors">
                  {item.title}
                </h3>
                <p className="text-slate-600 leading-relaxed mb-8 flex-1 font-medium">
                  {item.summary}
                </p>
                <div className="flex items-center text-sm font-bold text-slate-400 group-hover:text-blue-600 transition-colors mt-auto">
                  Read Article <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <div className="bg-blue-50 rounded-3xl p-8 max-w-3xl mx-auto border border-blue-100">
              <HelpCircle className="w-10 h-10 text-blue-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Have a specific loan question?</h3>
              <p className="text-slate-600 mb-6">Don't rely on generic advice. Get your profile reviewed by the founder today.</p>
              <a href="/#consulting" className="inline-block px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors">
                Book Expert Consultation
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
