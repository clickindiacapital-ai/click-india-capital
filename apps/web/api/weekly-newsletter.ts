import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const resend = new Resend(process.env.RESEND_API_KEY);
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log("Starting weekly newsletter blast...");

    // 1. Fetch all subscribers
    const { data: subscribers, error: subError } = await supabase
      .from('subscribers')
      .select('email');
      
    if (subError) throw subError;
    if (!subscribers || subscribers.length === 0) {
      console.log("No subscribers found. Exiting.");
      return res.status(200).json({ message: "No subscribers." });
    }

    // 2. Fetch the top news from the last 7 days
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const { data: news, error: newsError } = await supabase
      .from('daily_insights')
      .select('*')
      .gte('published_at', oneWeekAgo.toISOString())
      .order('published_at', { ascending: false })
      .limit(5);

    if (newsError) throw newsError;

    let newsHtml = '<p>No major financial news this week.</p>';
    if (news && news.length > 0) {
      newsHtml = news.map(item => `
        <div style="margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid #eee;">
          <h3 style="color: #2563eb; margin-bottom: 8px;">
            <a href="${item.url}" style="text-decoration: none; color: #2563eb;">${item.title}</a>
          </h3>
          <p style="color: #475569; font-size: 14px; margin-bottom: 8px;">${item.summary}</p>
          <small style="color: #94a3b8;">Source: ${item.source}</small>
        </div>
      `).join('');
    }

    const emailHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b;">
        <h1 style="color: #0f172a; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">Click India Capital Weekly Insights</h1>
        <p>Here is your weekly roundup of the most important financial and market news in India.</p>
        <br/>
        ${newsHtml}
        <br/>
        <p style="font-size: 12px; color: #94a3b8; text-align: center;">
          You are receiving this because you subscribed to the Click India Capital newsletter.
        </p>
      </div>
    `;

    // 3. Send emails using Resend
    const emailsToSend = subscribers.map(sub => sub.email);
    
    const batchData = emailsToSend.map(email => ({
      from: 'Insights <insights@clickindiacapital.in>', 
      to: [email],
      subject: 'Your Weekly Financial Insights',
      html: emailHtml,
    }));

    await resend.batch.send(batchData);

    console.log(`Successfully sent newsletter to ${emailsToSend.length} subscribers.`);

    return res.status(200).json({ message: "Newsletter sent successfully" });
  } catch (error) {
    console.error("Failed to send weekly newsletter:", error);
    return res.status(500).json({ error: "Failed to send newsletter" });
  }
}
