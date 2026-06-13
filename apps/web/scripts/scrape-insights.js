import Parser from 'rss-parser';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const parser = new Parser({
  customFields: {
    item: [
      ['media:content', 'mediaContent', { keepArray: false }],
      ['content:encoded', 'contentEncoded'],
      ['description', 'description']
    ]
  }
});

// Targeted Feeds: Banking, BFSI Top Stories, and Loans/Borrowing
const RSS_URLS = [
  'https://economictimes.indiatimes.com/industry/banking/finance/banking/rssfeeds/13358259.cms',
  'https://bfsi.economictimes.indiatimes.com/rss/topstories',
  'https://economictimes.indiatimes.com/wealth/borrow/rssfeeds/837555174.cms'
];

const OUTPUT_PATH = path.resolve(__dirname, '../public/insights.json');
const MAX_ARTICLES = 200;

async function scrapeInsights() {
  console.log('Fetching financial news from multiple sources...');
  try {
    let newItems = [];
    
    for (const url of RSS_URLS) {
      try {
        const feed = await parser.parseURL(url);
        newItems = [...newItems, ...feed.items];
      } catch (err) {
        console.warn(`Failed to fetch from ${url}:`, err.message);
      }
    }

    // Process new items into our format
    const processedNewArticles = newItems.map((item) => {
      let imageUrl = 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&q=80'; // fallback
      
      if (item.enclosure && item.enclosure.url) {
        imageUrl = item.enclosure.url;
      } else if (item.mediaContent && item.mediaContent.$ && item.mediaContent.$.url) {
        imageUrl = item.mediaContent.$.url;
      } else if (item.description) {
        const imgMatch = item.description.match(/src=["'](.*?)["']/);
        if (imgMatch && imgMatch[1]) {
          imageUrl = imgMatch[1];
        }
      }

      let excerpt = (item.contentSnippet || item.description || '').replace(/<[^>]+>/g, '').trim();
      if (excerpt.length > 150) {
        excerpt = excerpt.substring(0, 147) + '...';
      }

      const dateObj = new Date(item.pubDate);
      const formattedDate = dateObj.toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric'
      });

      return {
        id: item.link, 
        title: item.title,
        excerpt: excerpt,
        date: formattedDate,
        timestamp: dateObj.getTime(), // Added for accurate sorting across old/new
        category: 'Banking & Finance',
        link: item.link,
        image: imageUrl
      };
    });

    // Load existing articles
    let existingArticles = [];
    if (fs.existsSync(OUTPUT_PATH)) {
      try {
        const fileData = fs.readFileSync(OUTPUT_PATH, 'utf-8');
        existingArticles = JSON.parse(fileData);
      } catch (e) {
        console.warn('Could not parse existing insights.json, starting fresh.');
      }
    }

    // Combine all articles
    const allArticles = [...processedNewArticles, ...existingArticles];

    // Deduplicate by link
    const uniqueArticles = [];
    const seenLinks = new Set();
    for (const article of allArticles) {
      if (!seenLinks.has(article.link)) {
        seenLinks.add(article.link);
        uniqueArticles.push(article);
      }
    }

    // Sort by timestamp descending
    uniqueArticles.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

    // Limit to MAX_ARTICLES and re-assign clean IDs
    const finalArticles = uniqueArticles.slice(0, MAX_ARTICLES).map((article, index) => {
      return {
        ...article,
        id: index + 1
      };
    });

    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(finalArticles, null, 2), 'utf-8');
    
    console.log(`Successfully built archive of ${finalArticles.length} articles and saved to public/insights.json`);
  } catch (error) {
    console.error('Error fetching RSS feed:', error);
    process.exit(1);
  }
}

scrapeInsights();
