const express = require('express');
const router = express.Router();
const { readJSON } = require('../repositories/adapters/jsonFileAdapter');
const config = require('../config');
const { success, notFound } = require('../utils/responseHelper');

// GET /api/guides — list published admin-managed guides
router.get('/', async (req, res, next) => {
  try {
    const data = await readJSON(config.data.guidesAdminFile);
    const guides = (data.guides || [])
      .filter(g => g.status === 'published')
      .map(g => ({
        id: g.id, slug: g.slug, title: g.title,
        metaDescription: g.metaDescription, category: g.category,
        relatedTool: g.relatedTool, readTime: g.readTime,
        tags: g.tags || [], publishedAt: g.publishedAt,
      }));
    return success(res, guides);
  } catch (err) {
    next(err);
  }
});

// GET /api/guides/:slug — single published guide (full content)
router.get('/:slug', async (req, res, next) => {
  try {
    const data = await readJSON(config.data.guidesAdminFile);
    const guide = (data.guides || []).find(
      g => (g.slug === req.params.slug || g.id === req.params.slug) && g.status === 'published'
    );
    if (!guide) return notFound(res, 'Guide not found');
    return success(res, guide);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
