/**
 * Analytics Engine — derives AI-style insights from raw analytics data.
 * Compares current period vs previous period to surface trends.
 */
const analyticsRepo = require('../repositories/analyticsRepository');

/** Extract tool slugs from page view paths like /tools/compress-image */
function toolUsageFromViews(views) {
  const usage = {};
  views.forEach(v => {
    const m = v.path.match(/^\/tools\/([^/?#]+)/);
    if (m) {
      const slug = m[1];
      usage[slug] = (usage[slug] || 0) + 1;
    }
  });
  return usage;
}

/** Compute user stats from a views array */
function userStatsFromViews(views) {
  const today = new Date().toISOString().slice(0, 10);
  const todayViews = views.filter(v => v.timestamp?.slice(0, 10) === today);

  const uniqueIPs = new Set(todayViews.map(v => v.ip)).size;

  // Browser detection from userAgent
  const browsers = {};
  todayViews.forEach(v => {
    const ua = (v.userAgent || '').toLowerCase();
    let browser = 'Other';
    if (ua.includes('chrome') && !ua.includes('edg')) browser = 'Chrome';
    else if (ua.includes('firefox')) browser = 'Firefox';
    else if (ua.includes('safari') && !ua.includes('chrome')) browser = 'Safari';
    else if (ua.includes('edg')) browser = 'Edge';
    browsers[browser] = (browsers[browser] || 0) + 1;
  });

  // Activity per hour (today)
  const byHour = {};
  for (let h = 0; h < 24; h++) byHour[String(h).padStart(2, '0')] = 0;
  todayViews.forEach(v => {
    const h = v.timestamp?.slice(11, 13) || '00';
    if (byHour[h] !== undefined) byHour[h]++;
  });

  // Top paths today
  const byPath = {};
  todayViews.forEach(v => {
    byPath[v.path] = (byPath[v.path] || 0) + 1;
  });
  const topPaths = Object.entries(byPath)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([path, count]) => ({ path, count }));

  return {
    activeToday: uniqueIPs,
    totalViewsToday: todayViews.length,
    browsers: Object.entries(browsers).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count),
    byHour: Object.entries(byHour).map(([hour, count]) => ({ hour: `${hour}:00`, count })),
    topPaths,
  };
}

async function generateInsights(days = 30) {
  const raw = await analyticsRepo.getAnalytics();
  const allViews = raw.pageViews || [];

  const now = Date.now();
  const msPerDay = 24 * 60 * 60 * 1000;

  // Current period: last `days` days
  const currentStart = new Date(now - days * msPerDay);
  const currentViews = allViews.filter(v => new Date(v.timestamp) >= currentStart);

  // Previous period: days [2*days, days] ago
  const prevStart = new Date(now - 2 * days * msPerDay);
  const prevEnd = currentStart;
  const prevViews = allViews.filter(v => {
    const t = new Date(v.timestamp);
    return t >= prevStart && t < prevEnd;
  });

  const currentUsage = toolUsageFromViews(currentViews);
  const prevUsage    = toolUsageFromViews(prevViews);

  // Merge all known slugs
  const allSlugs = Array.from(new Set([
    ...Object.keys(currentUsage),
    ...Object.keys(prevUsage),
  ]));

  const withGrowth = allSlugs
    .map(slug => {
      const curr = currentUsage[slug] || 0;
      const prev = prevUsage[slug] || 0;
      const growth = prev > 0 ? ((curr - prev) / prev) * 100 : null;
      return { slug, curr, prev, growth };
    })
    .sort((a, b) => b.curr - a.curr);

  const totalUses    = withGrowth.reduce((s, t) => s + t.curr, 0);
  const avgUses      = withGrowth.length > 0 ? totalUses / withGrowth.length : 0;

  const best     = withGrowth[0];
  const worst    = withGrowth.length > 1 ? withGrowth[withGrowth.length - 1] : null;
  const growing  = withGrowth.filter(t => t.growth !== null && t.growth >= 20).slice(0, 3);
  const declining = withGrowth.filter(t => t.growth !== null && t.growth <= -20).slice(0, 3);
  const lowTraffic = withGrowth.filter(t => t.curr > 0 && t.curr < avgUses * 0.35);

  function label(slug) {
    return slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }

  const insights = [];

  if (best && best.curr > 0) {
    insights.push({
      type: 'best',
      icon: '🏆',
      title: 'Top Performing Tool',
      message: `${label(best.slug)} is your best performing tool with ${best.curr} uses in the last ${days} days.`,
      tool: best.slug,
      value: best.curr,
    });
  }

  if (worst && worst.curr > 0 && worst.slug !== best?.slug) {
    insights.push({
      type: 'worst',
      icon: '📉',
      title: 'Lowest Performing Tool',
      message: `${label(worst.slug)} has only ${worst.curr} uses. Consider adding a guide article to boost SEO.`,
      tool: worst.slug,
      value: worst.curr,
    });
  }

  growing.forEach(t => {
    insights.push({
      type: 'growing',
      icon: '📈',
      title: 'Growing Traffic',
      message: `${label(t.slug)} traffic increased ${Math.round(t.growth)}% compared to the previous period.`,
      tool: t.slug,
      growth: Math.round(t.growth),
    });
  });

  declining.forEach(t => {
    insights.push({
      type: 'declining',
      icon: '⚠️',
      title: 'Declining Traffic',
      message: `${label(t.slug)} traffic dropped ${Math.round(Math.abs(t.growth))}%. Review landing page SEO and tool functionality.`,
      tool: t.slug,
      growth: Math.round(t.growth),
    });
  });

  // SEO opportunities
  lowTraffic.slice(0, 3).forEach(t => {
    insights.push({
      type: 'opportunity',
      icon: '💡',
      title: 'SEO Opportunity',
      message: `${label(t.slug)} has low traffic (${t.curr} views). Publishing a how-to guide could significantly boost visibility.`,
      tool: t.slug,
      value: t.curr,
    });
  });

  // Revenue opportunity: highest traffic tool (most likely to convert)
  if (best && best.curr > 0) {
    insights.push({
      type: 'revenue',
      icon: '💰',
      title: 'Revenue Opportunity',
      message: `${label(best.slug)} generates the most engagement — it's the best candidate for premium features or ad placement.`,
      tool: best.slug,
    });
  }

  if (insights.length === 0) {
    insights.push({
      type: 'empty',
      icon: '📊',
      title: 'Not Enough Data',
      message: 'Not enough usage data yet to generate insights. Check back after more tool usage is recorded.',
    });
  }

  return {
    insights,
    period: days,
    stats: {
      topTools: withGrowth.slice(0, 10).map(t => ({ ...t, label: label(t.slug) })),
      totalUses,
      uniqueTools: withGrowth.filter(t => t.curr > 0).length,
      totalViews: currentViews.length,
    },
  };
}

async function getUserStats() {
  const raw = await analyticsRepo.getAnalytics();
  return userStatsFromViews(raw.pageViews || []);
}

module.exports = { generateInsights, getUserStats };
