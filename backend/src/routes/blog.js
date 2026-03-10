const express = require('express');
const router = express.Router();
const { readJSON } = require('../repositories/adapters/jsonFileAdapter');
const config = require('../config');
const { success, notFound } = require('../utils/responseHelper');

// GET /api/blog — list published posts (summary only, no full content)
router.get('/', async (req, res, next) => {
  try {
    const data = await readJSON(config.data.blogFile);
    const posts = (data.posts || [])
      .filter(p => p.status === 'published')
      .map(p => ({
        id: p.id, slug: p.slug, title: p.title,
        metaDescription: p.metaDescription,
        tags: p.tags || [], coverImage: p.coverImage || null,
        publishedAt: p.publishedAt, readTime: p.readTime,
      }));
    return success(res, posts);
  } catch (err) {
    next(err);
  }
});

// GET /api/blog/:slug — single published post (full content)
router.get('/:slug', async (req, res, next) => {
  try {
    const data = await readJSON(config.data.blogFile);
    const post = (data.posts || []).find(
      p => p.slug === req.params.slug && p.status === 'published'
    );
    if (!post) return notFound(res, 'Post not found');
    return success(res, post);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
