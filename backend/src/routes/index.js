const express = require('express');
const router = express.Router();
const toolsRoutes = require('./tools');
const adminRoutes = require('./admin');
const analyticsController = require('../controllers/admin/analyticsController');
const { trackLimiter } = require('../middleware/rateLimiter');

// Public tracking endpoint (frontend page views)
router.post('/track', trackLimiter, analyticsController.track);

// Tool endpoints
router.use('/tools', toolsRoutes);

// Admin endpoints
router.use('/admin', adminRoutes);

// API info
router.get('/', (req, res) => {
  res.json({
    name: 'Tooli API',
    version: '1.0.0',
    endpoints: ['/api/tools', '/api/admin', '/api/track'],
  });
});

module.exports = router;
