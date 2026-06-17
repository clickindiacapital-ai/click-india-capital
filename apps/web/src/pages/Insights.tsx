import { useState, useEffect } from 'react';
import { HelpCircle, BookOpen, ChevronRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';

export default function Insights() {
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const { data, error } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('published', true)
          .order('created_at', { ascending: false });
        if (data && !error) {
          setPosts(data);
        }
      } catch (err) {
        console.error('Error loading insights posts:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchPosts();
  }, []);

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800">
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
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight text-white">
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
          {isLoading ? (
            <div className="py-20 text-center text-slate-500 flex flex-col items-center gap-2">
              <Loader2 className="animate-spin text-blue-500" size={28} />
              <span>Fetching dynamic articles...</span>
            </div>
          ) : posts.length === 0 ? (
            <div className="py-20 text-center text-slate-400">
              No published articles found. Check back later!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post, index) => (
                <Link to={`/insights/${post.slug}`} key={post.id} className="h-full">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="bg-white p-8 rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col h-full group cursor-pointer"
                  >
                    {post.image_url && (
                      <img src={post.image_url} alt="" className="w-full h-40 rounded-2xl object-cover mb-6 border border-slate-100" />
                    )}
                    <div className="text-xs font-black text-blue-600 uppercase tracking-widest mb-4">
                      {post.category}
                    </div>
                    <h3 className="text-xl font-extrabold text-slate-900 mb-4 group-hover:text-blue-600 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-slate-600 leading-relaxed mb-8 flex-1 font-medium">
                      {post.excerpt || (post.content && post.content.substring(0, 120) + '...')}
                    </p>
                    <div className="flex items-center text-sm font-bold text-slate-400 group-hover:text-blue-600 transition-colors mt-auto">
                      Read Article <ChevronRight className="w-4 h-4 ml-1" />
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          )}

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

