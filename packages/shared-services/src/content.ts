import { getSupabase } from './supabase';

export interface InsightArticle {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  category: string;
  read_time: string;
  featured: boolean;
  source_url?: string;
  published_at: string;
}

export const contentService = {
  async getLatestArticles(limit: number = 10): Promise<{ data: InsightArticle[] | null, error: any }> {
    const client = getSupabase();
    return await client
      .from('insight_articles')
      .select('*')
      .order('published_at', { ascending: false })
      .limit(limit);
  },

  async getArticlesByCategory(category: string): Promise<{ data: InsightArticle[] | null, error: any }> {
    const client = getSupabase();
    const query = client
      .from('insight_articles')
      .select('*')
      .order('published_at', { ascending: false });
    
    if (category !== 'All') {
      query.eq('category', category);
    }
    
    return await query;
  },

  async publishArticle(article: Omit<InsightArticle, 'id' | 'published_at'>): Promise<{ data: InsightArticle | null, error: any }> {
    const client = getSupabase();
    return await client
      .from('insight_articles')
      .insert([article])
      .select()
      .single();
  }
};
