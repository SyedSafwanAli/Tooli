const express = require('express');
const router = express.Router();
const toolsRoutes    = require('./tools');
const adminRoutes    = require('./admin');
const blogRoutes     = require('./blog');
const guidesRoutes   = require('./guides');
const analyticsController = require('../controllers/admin/analyticsController');
const { trackLimiter } = require('../middleware/rateLimiter');

// Public tracking endpoint (frontend page views)
router.post('/track', trackLimiter, analyticsController.track);

// Tool endpoints
router.use('/tools', toolsRoutes);

// Admin endpoints
router.use('/admin', adminRoutes);

// Public blog (published posts only, no auth)
router.use('/blog', blogRoutes);

// Public admin-managed guides (published only, no auth)
router.use('/guides-api', guidesRoutes);

// API info
router.get('/', (req, res) => {
  res.json({
    name: 'Tooli API',
    version: '1.0.0',
    endpoints: ['/api/tools', '/api/admin', '/api/blog', '/api/guides-api', '/api/track'],
  });
});

module.exports = router;
