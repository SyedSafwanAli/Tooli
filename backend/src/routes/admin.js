const express = require('express');
const router = express.Router();
const authController          = require('../controllers/admin/authController');
const analyticsController     = require('../controllers/admin/analyticsController');
const revenueController       = require('../controllers/admin/revenueController');
const systemController        = require('../controllers/admin/systemController');
const toolsController         = require('../controllers/admin/toolsController');
const logsController          = require('../controllers/admin/logsController');
const seoController           = require('../controllers/admin/seoController');
const aiInsightsController    = require('../controllers/admin/aiInsightsController');
const blogAdminController     = require('../controllers/admin/blogAdminController');
const guidesAdminController   = require('../controllers/admin/guidesAdminController');
const auth                    = require('../middleware/auth');
const { authLimiter }         = require('../middleware/rateLimiter');
const { uploadImage }         = require('../middleware/upload');

// ── Auth ──────────────────────────────────────────────────────────────────────
router.post('/login',    authLimiter, authController.login);
router.get('/me',        auth, authController.getMe);
router.put('/password',  auth, authController.changePassword);

// ── Analytics ─────────────────────────────────────────────────────────────────
router.get('/analytics',         auth, analyticsController.getAll);
router.get('/analytics/summary', auth, analyticsController.getSummary);
router.delete('/analytics',      auth, analyticsController.clear);

// ── AI Insights ───────────────────────────────────────────────────────────────
router.get('/insights',       auth, aiInsightsController.getInsights);
router.get('/insights/users', auth, aiInsightsController.getUserStats);

// ── Revenue ───────────────────────────────────────────────────────────────────
router.get('/revenue',            auth, revenueController.getAll);
router.post('/revenue',           auth, revenueController.add);
router.put('/revenue/:id',        auth, revenueController.update);
router.delete('/revenue/:id',     auth, revenueController.remove);
router.get('/revenue/summary',    auth, revenueController.getSummary);
router.get('/revenue/categories', auth, revenueController.getCategories);

// ── System health ─────────────────────────────────────────────────────────────
router.get('/system', auth, systemController.getHealth);

// ── Tool overrides ────────────────────────────────────────────────────────────
router.get('/tools',        auth, toolsController.getOverrides);
router.put('/tools/:id',    auth, toolsController.updateOverride);
router.delete('/tools/:id', auth, toolsController.deleteOverride);

// ── File processing logs ──────────────────────────────────────────────────────
router.get('/logs',    auth, logsController.getLogs);
router.delete('/logs', auth, logsController.clearLogs);

// ── SEO meta ─────────────────────────────────────────────────────────────────
router.get('/seo',              auth, seoController.getMeta);
router.post('/seo',             auth, seoController.updateMeta);
router.delete('/seo/:path(*)',  auth, seoController.deleteMeta);

// ── Blog (admin CRUD) ─────────────────────────────────────────────────────────
router.get('/blog',          auth, blogAdminController.getAll);
router.get('/blog/:id',      auth, blogAdminController.getOne);
router.post('/blog',         auth, uploadImage.single('cover'), blogAdminController.create);
router.put('/blog/:id',      auth, uploadImage.single('cover'), blogAdminController.update);
router.delete('/blog/:id',   auth, blogAdminController.remove);

// ── Guides (admin CRUD) ───────────────────────────────────────────────────────
router.get('/guides',        auth, guidesAdminController.getAll);
router.get('/guides/:id',    auth, guidesAdminController.getOne);
router.post('/guides',       auth, guidesAdminController.create);
router.put('/guides/:id',    auth, guidesAdminController.update);
router.delete('/guides/:id', auth, guidesAdminController.remove);

module.exports = router;
