const analyticsRepo = require('../repositories/analyticsRepository');

async function getSummary(days = 30) {
  return analyticsRepo.getPageViewSummary({ days: parseInt(days) });
}

async function getAll() {
  return analyticsRepo.getAnalytics();
}

async function clear() {
  await analyticsRepo.clearAnalytics();
  return { message: 'Analytics cleared' };
}

async function trackPageView(data) {
  await analyticsRepo.recordPageView(data);
}

async function trackToolUse(toolSlug) {
  await analyticsRepo.recordToolUse(toolSlug);
}

module.exports = { getSummary, getAll, clear, trackPageView, trackToolUse };
