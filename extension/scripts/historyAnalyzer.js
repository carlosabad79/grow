const CATEGORY_KEYWORDS = {
  learning: ['wikipedia', 'medium', 'stack', 'research', 'science', 'edu', 'tutorial'],
  social: ['facebook', 'instagram', 'twitter', 'tiktok', 'linkedin', 'reddit', 'discord'],
  entertainment: ['youtube', 'netflix', 'spotify', 'hulu', 'twitch', 'games', 'imdb'],
  lifestyle: ['blog', 'travel', 'recipe', 'fitness', 'health', 'mindfulness', 'meditation'],
  shopping: ['amazon', 'ebay', 'etsy', 'shop', 'store', 'deal'],
};

export function computeHistoryFeatures(items) {
  const totals = {
    visits: items.length,
    learning: 0,
    social: 0,
    entertainment: 0,
    lifestyle: 0,
    shopping: 0,
    nightBrowsing: 0,
  };

  items.forEach((item) => {
    const url = (item.url || '').toLowerCase();
    const title = (item.title || '').toLowerCase();
    const timestamp = item.lastVisitTime || Date.now();
    const hour = new Date(timestamp).getHours();

    if (hour >= 22 || hour <= 4) {
      totals.nightBrowsing += 1;
    }

    Object.entries(CATEGORY_KEYWORDS).forEach(([category, keywords]) => {
      if (keywords.some((keyword) => url.includes(keyword) || title.includes(keyword))) {
        totals[category] += 1;
      }
    });
  });

  const divisor = Math.max(totals.visits, 1);
  return [
    totals.learning / divisor,
    totals.social / divisor,
    totals.entertainment / divisor,
    totals.lifestyle / divisor,
    totals.shopping / divisor,
    totals.nightBrowsing / divisor,
  ];
}

export async function fetchRecentHistory(days = 7, maxResults = 200) {
  const millisecondsPerDay = 1000 * 60 * 60 * 24;
  const startTime = Date.now() - days * millisecondsPerDay;
  return new Promise((resolve) => {
    chrome.history.search(
      {
        text: '',
        startTime,
        maxResults,
      },
      (results) => {
        resolve(results || []);
      }
    );
  });
}
