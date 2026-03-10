const analyticsEngine = require('../../services/analyticsEngine');
const { success } = require('../../utils/responseHelper');

const getInsights = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const data = await analyticsEngine.generateInsights(days);
    return success(res, data);
  } catch (err) {
    next(err);
  }
};

const getUserStats = async (req, res, next) => {
  try {
    const data = await analyticsEngine.getUserStats();
    return success(res, data);
  } catch (err) {
    next(err);
  }
};

module.exports = { getInsights, getUserStats };
