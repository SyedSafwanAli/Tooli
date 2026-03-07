const analyticsService = require('../../services/analyticsService');
const { success, error } = require('../../utils/responseHelper');
const { v4: uuidv4 } = require('uuid');

const getSummary = async (req, res, next) => {
  try {
    const { days } = req.query;
    const data = await analyticsService.getSummary(days || 30);
    return success(res, data);
  } catch (err) {
    next(err);
  }
};

const getAll = async (req, res, next) => {
  try {
    const data = await analyticsService.getAll();
    // Return only last 1000 raw views to avoid huge response
    data.pageViews = data.pageViews.slice(-1000);
    return success(res, data);
  } catch (err) {
    next(err);
  }
};

const clear = async (req, res, next) => {
  try {
    const result = await analyticsService.clear();
    return success(res, null, result.message);
  } catch (err) {
    next(err);
  }
};

const track = async (req, res, next) => {
  try {
    const { page, path: pagePath } = req.body;
    await analyticsService.trackPageView({
      id: uuidv4(),
      path: pagePath || page || '/',
      method: 'GET',
      ip: req.ip || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown',
      timestamp: new Date().toISOString(),
      duration: 0,
    });
    return success(res, null, 'Tracked');
  } catch (err) {
    next(err);
  }
};

module.exports = { getSummary, getAll, clear, track };
