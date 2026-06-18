import React, { useState, useEffect } from 'react';
import { Search, Plus, Loader2, Edit2, Trash2, Check, X, FileText } from 'lucide-react';
import supabase from '../services/supabaseClient';

type BlogPost = {
  id: string;
  created_at: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  category: string;
  image_url?: string;
  author: string;
  published: boolean;
};

export default function BlogManager() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [category, setCategory] = useState('Advisory Guides');
  const [imageUrl, setImageUrl] = useState('');
  const [author, setAuthor] = useState('Advisory Lead');
  const [isPublished, setIsPublished] = useState(true);

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setPosts(data || []);
    } catch (err) {
      console.error('Error fetching blog posts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    // Auto-generate slug from title if not manually editing slug
    if (!isEditing) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
      );
    }
  };

  const resetForm = () => {
    setTitle('');
    setSlug('');
    setContent('');
    setExcerpt('');
    setCategory('Advisory Guides');
    setImageUrl('');
    setAuthor('Advisory Lead');
    setIsPublished(true);
    setIsEditing(false);
    setSelectedId(null);
  };

  const handleOpenAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (post: BlogPost) => {
    setTitle(post.title);
    setSlug(post.slug);
    setContent(post.content);
    setExcerpt(post.excerpt || '');
    setCategory(post.category);
    setImageUrl(post.image_url || '');
    setAuthor(post.author);
    setIsPublished(post.published);
    setIsEditing(true);
    setSelectedId(post.id);
    setIsModalOpen(true);
  };

  const handleSavePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !slug.trim() || !content.trim()) return;

    setIsSaving(true);
    const postPayload = {
      title,
      slug,
      content,
      excerpt: excerpt || null,
      category,
      image_url: imageUrl || null,
      author,
      published: isPublished
    };

    try {
      if (isEditing && selectedId) {
        const { error } = await supabase
          .from('blog_posts')
          .update(postPayload)
          .eq('id', selectedId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('blog_posts')
          .insert([postPayload]);
        if (error) throw error;
      }
      setIsModalOpen(false);
      fetchPosts();
    } catch (err) {
      console.error('Error saving post:', err);
      alert('Failed to save article.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePost = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this article?')) return;
    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id);
      if (error) throw error;
      fetchPosts();
    } catch (err) {
      console.error('Error deleting article:', err);
    }
  };

  const filteredPosts = posts.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col bg-slate-50 text-slate-800">
      {/* Header */}
      <div className="px-8 py-6 border-b border-slate-200 bg-white flex justify-between items-center flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Insights CMS</h1>
          <p className="text-slate-500 text-sm mt-1">Publish and edit advisory guide articles on the customer website.</p>
        </div>
        <button 
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-sm text-sm"
        >
          <Plus size={16} />
          <span>New Article</span>
        </button>
      </div>

      <div className="flex-1 p-8 overflow-hidden flex flex-col">
        {/* Search */}
        <div className="flex justify-between items-center mb-6 flex-shrink-0">
          <div className="relative w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search articles by title or category..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all text-sm"
            />
          </div>
        </div>

        {/* List Grid */}
        <div className="flex-1 overflow-y-auto space-y-4">
          {isLoading ? (
            <div className="py-20 text-center text-slate-500 flex flex-col items-center gap-2">
              <Loader2 className="animate-spin text-blue-500" size={24} />
              <span>Loading articles...</span>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="py-20 text-center text-slate-400">
              No articles found. Click "New Article" to write your first post.
            </div>
          ) : (
            filteredPosts.map(post => (
              <div key={post.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex gap-6 items-start hover:border-slate-300 transition-colors">
                {post.image_url ? (
                  <img src={post.image_url} alt="" className="w-32 h-24 rounded-xl object-cover shrink-0 bg-slate-100 border border-slate-100" />
                ) : (
                  <div className="w-32 h-24 rounded-xl bg-slate-100 border border-slate-100 flex items-center justify-center shrink-0">
                    <FileText className="w-8 h-8 text-slate-400" />
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full">
                      {post.category}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${post.published ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                      {post.published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg text-slate-900 mt-2 hover:text-blue-600 transition-colors truncate">{post.title}</h3>
                  <p className="text-xs text-slate-500 mt-1">Written by {post.author} • {new Date(post.created_at).toLocaleDateString()}</p>
                  <p className="text-sm text-slate-600 mt-2 line-clamp-2">{post.excerpt || 'No excerpt provided.'}</p>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => handleOpenEditModal(post)}
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-100"
                    title="Edit article"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => handleDeletePost(post.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-100"
                    title="Delete article"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Editor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 flex-shrink-0">
              <h2 className="font-bold text-lg text-slate-900">
                {isEditing ? 'Edit Article' : 'Compose Insights Article'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSavePost} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Title</label>
                <input 
                  type="text" 
                  required
                  value={title}
                  onChange={e => handleTitleChange(e.target.value)}
                  placeholder="e.g. How FOIR Affects Your Loan Application"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Slug (URL path)</label>
                  <input 
                    type="text" 
                    required
                    value={slug}
                    onChange={e => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                    placeholder="e.g. foir-affects-loan"
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Category</label>
                  <select 
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 font-medium"
                  >
                    <option value="Advisory Guides">Advisory Guides</option>
                    <option value="Debt Strategy">Debt Strategy</option>
                    <option value="Credit Repair">Credit Repair</option>
                    <option value="Ecosystem Updates">Ecosystem Updates</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Cover Image URL</label>
                  <input 
                    type="text" 
                    value={imageUrl}
                    onChange={e => setImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Excerpt (Short Summary)</label>
                <textarea 
                  value={excerpt}
                  onChange={e => setExcerpt(e.target.value)}
                  placeholder="Summarize the core takeaway in 2 sentences..."
                  rows={2}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Article Content (Markdown supported)</label>
                <textarea 
                  required
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="### Use markdown headers, lists, and bold text..."
                  rows={8}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 font-mono"
                />
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={isPublished}
                    onChange={e => setIsPublished(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                  />
                  <span>Publish Immediately</span>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3 flex-shrink-0">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors font-medium text-sm"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold shadow-sm text-sm disabled:opacity-50 flex items-center gap-2"
                >
                  {isSaving && <Loader2 className="animate-spin" size={14} />}
                  <span>{isSaving ? 'Publishing...' : 'Save Article'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
