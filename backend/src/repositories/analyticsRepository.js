/**
 * Analytics Repository
 * All data access for analytics goes through here.
 * Replace jsonFileAdapter with a DB adapter to plug in MongoDB/PostgreSQL.
 */

const { readJSON, writeJSON } = require('./adapters/jsonFileAdapter');
const config = require('../config');

const FILE = config.data.analyticsFile;

// In-memory buffer for high-frequency writes
const writeBuffer = [];
let flushTimer = null;

function scheduleFlush() {
  if (flushTimer) return;
  flushTimer = setTimeout(async () => {
    await flush();
    flushTimer = null;
  }, 5000); // flush every 5s
}

async function flush() {
  if (writeBuffer.length === 0) return;
  const data = await readJSON(FILE);
  const batch = writeBuffer.splice(0, writeBuffer.length);
  data.pageViews.push(...batch);

  // Keep only last 10,000 page views to prevent unbounded growth
  if (data.pageViews.length > 10000) {
    data.pageViews = data.pageViews.slice(-10000);
  }

  await writeJSON(FILE, data);
}

async function recordPageView(view) {
  writeBuffer.push({
    id: view.id,
    path: view.path,
    method: view.method,
    ip: view.ip,
    userAgent: view.userAgent,
    timestamp: view.timestamp,
    duration: view.duration,
  });
  scheduleFlush();
}

async function recordToolUse(toolSlug) {
  const data = await readJSON(FILE);
  data.toolUsage[toolSlug] = (data.toolUsage[toolSlug] || 0) + 1;
  await writeJSON(FILE, data);
}

async function getAnalytics() {
  // Ensure buffer is flushed before returning data
  await flush();
  return readJSON(FILE);
}

async function getPageViewSummary({ days = 30 } = {}) {
  const data = await getAnalytics();
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const filtered = data.pageViews.filter(v => new Date(v.timestamp) >= since);

  // Group by day
  const byDay = {};
  filtered.forEach(v => {
    const day = v.timestamp.slice(0, 10);
    byDay[day] = (byDay[day] || 0) + 1;
  });

  // Top pages
  const byPath = {};
  filtered.forEach(v => {
    byPath[v.path] = (byPath[v.path] || 0) + 1;
  });
  const topPages = Object.entries(byPath)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([path, count]) => ({ path, count }));

  return {
    totalViews: filtered.length,
    byDay: Object.entries(byDay).sort().map(([date, count]) => ({ date, count })),
    topPages,
    toolUsage: data.toolUsage,
  };
}

async function clearAnalytics() {
  await writeJSON(FILE, { pageViews: [], toolUsage: {}, dailySummary: [] });
}

module.exports = { recordPageView, recordToolUse, getAnalytics, getPageViewSummary, clearAnalytics };
