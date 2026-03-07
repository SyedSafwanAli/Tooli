const express = require('express');
const router = express.Router();
const authController = require('../controllers/admin/authController');
const analyticsController = require('../controllers/admin/analyticsController');
const revenueController = require('../controllers/admin/revenueController');
const auth = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

// Auth routes
router.post('/login', authLimiter, authController.login);
router.get('/me', auth, authController.getMe);
router.put('/password', auth, authController.changePassword);

// Analytics routes (protected)
router.get('/analytics', auth, analyticsController.getAll);
router.get('/analytics/summary', auth, analyticsController.getSummary);
router.delete('/analytics', auth, analyticsController.clear);

// Revenue routes (protected)
router.get('/revenue', auth, revenueController.getAll);
router.post('/revenue', auth, revenueController.add);
router.put('/revenue/:id', auth, revenueController.update);
router.delete('/revenue/:id', auth, revenueController.remove);
router.get('/revenue/summary', auth, revenueController.getSummary);
router.get('/revenue/categories', auth, revenueController.getCategories);

module.exports = router;
