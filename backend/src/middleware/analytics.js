const { v4: uuidv4 } = require('uuid');
const { recordPageView } = require('../repositories/analyticsRepository');

/**
 * Analytics middleware — records every API request.
 * Non-blocking: writes are buffered by the repository.
 */
const analyticsMiddleware = (req, res, next) => {
  const start = Date.now();
  const id = uuidv4();

  res.on('finish', () => {
    // Skip health checks and static file requests
    if (req.path === '/health' || req.path.startsWith('/uploads')) return;

    recordPageView({
      id,
      path: req.originalUrl,
      method: req.method,
      ip: req.ip || req.headers['x-forwarded-for'] || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown',
      timestamp: new Date().toISOString(),
      duration: Date.now() - start,
      status: res.statusCode,
    }).catch(() => {}); // fire-and-forget, never block response
  });

  next();
};

module.exports = analyticsMiddleware;
