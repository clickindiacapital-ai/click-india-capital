import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Loader2, AlertCircle, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { submitToWeb3Forms } from '../utils/web3forms';

export default function InsightDetail() {
  const { id } = useParams(); // id holds the slug parameter
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isNewsletterLoading, setIsNewsletterLoading] = useState(false);

  const [post, setPost] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    async function getPost() {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('slug', id)
          .single();
        
        if (error || !data) {
          setIsError(true);
        } else {
          setPost(data);
        }
      } catch (err) {
        setIsError(true);
        console.error('Error fetching blog post:', err);
      } finally {
        setIsLoading(false);
      }
    }
    getPost();
  }, [id]);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsNewsletterLoading(true);
    const success = await submitToWeb3Forms({ email, article: post?.title }, "Newsletter Subscription");
    setIsNewsletterLoading(false);
    
    if (success) {
      setIsSubscribed(true);
      setEmail('');
    } else {
      alert("Failed to subscribe. Please try again later.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center py-20 text-slate-500">
        <Loader2 className="w-10 h-10 animate-spin mb-4 text-blue-500" />
        <p>Loading insight...</p>
      </div>
    );
  }

  if (isError || !post) {
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
    <div className="bg-slate-50 min-h-screen py-12 text-slate-800">
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
          {post.image_url && (
            <div className="h-64 sm:h-96 w-full relative">
              <img 
                src={post.image_url} 
                alt={post.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-bold text-slate-800 uppercase tracking-wider shadow-sm">
                {post.category}
              </div>
            </div>
          )}

          <div className="p-8 sm:p-12">
            <div className="flex items-center text-slate-500 mb-6 gap-2 font-medium">
              <Calendar className="w-5 h-5" />
              {new Date(post.created_at).toLocaleDateString()} • Written by {post.author}
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-8 leading-tight">
              {post.title}
            </h1>
            
            {post.excerpt && (
              <div className="text-lg text-slate-700 leading-relaxed mb-8 border-l-4 border-blue-500 pl-6 italic">
                {post.excerpt}
              </div>
            )}

            {/* Custom Simple Markdown Content Parser */}
            <div className="prose max-w-none text-slate-700 leading-relaxed mb-12 space-y-5 font-medium">
              {post.content.split('\n').map((para: string, idx: number) => {
                const trimmed = para.trim();
                if (trimmed.startsWith('###')) {
                  return <h3 key={idx} className="text-xl font-bold text-slate-900 mt-6 mb-2">{trimmed.replace('###', '').trim()}</h3>;
                } else if (trimmed.startsWith('##')) {
                  return <h2 key={idx} className="text-2xl font-bold text-slate-900 mt-8 mb-3">{trimmed.replace('##', '').trim()}</h2>;
                } else if (trimmed.startsWith('#')) {
                  return <h1 key={idx} className="text-3xl font-extrabold text-slate-900 mt-10 mb-4">{trimmed.replace('#', '').trim()}</h1>;
                } else if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
                  return <li key={idx} className="list-disc pl-5 ml-4 my-1">{trimmed.substring(1).trim()}</li>;
                } else if (/^\d+\./.test(trimmed)) {
                  // numbered list
                  const content = trimmed.replace(/^\d+\./, '').trim();
                  return <li key={idx} className="list-decimal pl-5 ml-4 my-1">{content}</li>;
                } else if (trimmed === '') {
                  return null;
                }
                return <p key={idx} className="text-base my-2">{trimmed}</p>;
              })}
            </div>

            {/* Newsletter Subscription Box */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 sm:p-10 text-white shadow-xl relative overflow-hidden mb-12">
              <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
              <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
              
              <div className="relative z-10 text-center max-w-2xl mx-auto">
                <h3 className="text-2xl sm:text-3xl font-bold mb-4">Want more expert guidance?</h3>
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
                      disabled={isNewsletterLoading}
                      className="px-8 py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-400 text-white font-bold rounded-xl transition-colors flex items-center justify-center whitespace-nowrap shadow-lg shadow-blue-600/30 text-sm"
                    >
                      {isNewsletterLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Subscribe <Send className="w-4 h-4 ml-2" /></>}
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
