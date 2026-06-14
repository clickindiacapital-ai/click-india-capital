import Parser from 'rss-parser';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const parser = new Parser();

export default async function handler(req: any, res: any) {
  // Ensure this is only accessible via authorized methods (Vercel cron sends a specific header, though we can skip strict auth for now since it's just fetching public news)
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log("Fetching daily financial news...");
    
    // Fetch from Economic Times Top Stories RSS
    const feed = await parser.parseURL('https://economictimes.indiatimes.com/rssfeedstopstories.cms');
    
    // Get top 5 items
    const topItems = feed.items.slice(0, 5);
    
    const insightsToInsert = topItems.map(item => ({
      title: item.title || 'Financial Update',
      summary: item.contentSnippet || item.content || 'No summary available.',
      url: item.link || '',
      source: 'Economic Times',
      published_at: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString()
    }));
    
    // Insert into Supabase (ignoring duplicates based on URL unique constraint)
    const { error } = await supabase
      .from('daily_insights')
      .upsert(insightsToInsert, { onConflict: 'url' });
      
    if (error) throw error;
    
    console.log(`Successfully processed ${insightsToInsert.length} news items.`);
    
    return res.status(200).json({ message: "Daily news updated successfully" });
  } catch (error) {
    console.error("Failed to fetch daily news:", error);
    return res.status(500).json({ error: "Failed to process news" });
  }
}
