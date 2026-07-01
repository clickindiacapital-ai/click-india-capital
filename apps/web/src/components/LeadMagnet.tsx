import { useState } from 'react';
import { Download, CheckCircle2, X } from 'lucide-react';
import { supabase } from '../utils/supabaseClient';

export default function LeadMagnet() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const customerId = crypto.randomUUID();

      // 1. Insert into customers table
      const { error: customerError } = await supabase.from('customers').insert([{
        id: customerId,
        name: formData.name.trim(),
        email: formData.email,
        phone: formData.phone,
        primary_goal: 'Free Guide Download'
      }]);

      if (!customerError) {
        // 2. Insert into leads table
        await supabase.from('leads').insert([{
          customer_id: customerId,
          name: formData.name.trim(),
          email: formData.email,
          phone: formData.phone,
          source: 'Free Guide - Lead Magnet',
          status: 'NEW'
        }]);
      }
      setIsSuccess(true);
      // Trigger actual download of the PDF
      setTimeout(() => {
        setIsModalOpen(false);
        setIsSuccess(false);
        
        // Create an invisible anchor tag to trigger the file download
        const link = document.createElement('a');
        link.href = '/smart-finance-guide.pdf';
        link.download = 'The_Ultimate_Guide_to_Smart_Finance_Click_India_Capital.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }, 2000);
    } catch (error) {
      console.error('Error saving lead:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <section className="py-24 bg-white relative overflow-hidden border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center gap-16">
            
            {/* Left: Book Cover Image */}
            <div className="md:w-1/2 flex justify-center md:justify-end relative">
              <div className="absolute inset-0 bg-blue-100 rounded-full blur-3xl transform scale-110 -z-10"></div>
              <img 
                src="/smart-finance-ebook.png" 
                alt="The Ultimate Guide to Smart Finance" 
                className="w-full max-w-sm drop-shadow-2xl hover:-translate-y-2 transition-transform duration-500" 
              />
            </div>
            
            {/* Right: Copy & CTA */}
            <div className="md:w-1/2 space-y-8">
              <div className="space-y-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Free Resource
                </span>
                
                <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight">
                  Smart financial moves start here — claim your free guide.
                </h2>
                
                <p className="text-slate-600 text-lg leading-relaxed">
                  Your personalised financial blueprint for success. Master the art of securing Home, Personal, Business, and Vehicle loans in India.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1 w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                    <CheckCircle2 size={12} />
                  </div>
                  <p className="text-slate-700"><span className="font-bold text-slate-900">Quick & easy download</span> — no lengthy sign-ups</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                    <CheckCircle2 size={12} />
                  </div>
                  <p className="text-slate-700"><span className="font-bold text-slate-900">Insights for growth</span> — backed by financial experts</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                    <CheckCircle2 size={12} />
                  </div>
                  <p className="text-slate-700"><span className="font-bold text-slate-900">Designed for your industry</span> — practical, real-world advice</p>
                </div>
              </div>

              <button 
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 px-8 py-4 bg-pink-500 hover:bg-pink-600 text-white rounded-full font-bold text-lg transition-all shadow-xl shadow-pink-200"
              >
                Download my free guide
                <Download size={20} />
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl relative animate-in slide-in-from-bottom-10">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
            >
              <X size={18} />
            </button>
            
            <div className="p-8">
              {isSuccess ? (
                <div className="text-center space-y-4 py-8">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 size={32} />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900">Success!</h3>
                  <p className="text-slate-600">Your guide is ready for download.</p>
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">Where should we send it?</h3>
                    <p className="text-slate-600 text-sm">Enter your details to get instant access to the guide.</p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Full Name</label>
                      <input 
                        type="text" 
                        required
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        placeholder="e.g. Rahul Sharma"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Email Address</label>
                      <input 
                        type="email" 
                        required
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        placeholder="rahul@company.in"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Phone Number</label>
                      <input 
                        type="tel" 
                        required
                        value={formData.phone}
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        placeholder="+91 98765 43210"
                      />
                    </div>
                    
                    <button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="w-full mt-4 py-3.5 bg-pink-500 hover:bg-pink-600 text-white rounded-xl font-bold uppercase tracking-wider transition-all flex justify-center items-center gap-2 disabled:opacity-70 shadow-lg shadow-pink-200"
                    >
                      {isSubmitting ? 'Processing...' : 'Get The Guide Now'}
                    </button>
                    <p className="text-[10px] text-center text-slate-500 mt-4">We respect your privacy. No spam ever.</p>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
