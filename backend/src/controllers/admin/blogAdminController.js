const { readJSON, writeJSON, invalidateCache } = require('../../repositories/adapters/jsonFileAdapter');
const config = require('../../config');
const { success, badRequest, notFound } = require('../../utils/responseHelper');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs').promises;

const FILE = config.data.blogFile;

// ── Helpers ──────────────────────────────────────────────────────────────────

function slugify(str) {
  return str.toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// ── Controllers ───────────────────────────────────────────────────────────────

const getAll = async (req, res, next) => {
  try {
    const data = await readJSON(FILE);
    const posts = (data.posts || []).map(p => ({
      id: p.id, slug: p.slug, title: p.title,
      status: p.status, publishedAt: p.publishedAt,
      updatedAt: p.updatedAt, tags: p.tags || [],
      coverImage: p.coverImage || null,
    }));
    return success(res, posts);
  } catch (err) {
    next(err);
  }
};

const getOne = async (req, res, next) => {
  try {
    const data = await readJSON(FILE);
    const post = (data.posts || []).find(p => p.id === req.params.id);
    if (!post) return notFound(res, 'Post not found');
    return success(res, post);
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const { title, content, contentType, metaTitle, metaDescription, tags, status } = req.body;
    if (!title) return badRequest(res, 'Title is required');

    const now = new Date().toISOString();
    const post = {
      id: uuidv4(),
      slug: slugify(title),
      title,
      content: content || '',
      contentType: contentType || 'markdown',
      metaTitle: metaTitle || title,
      metaDescription: metaDescription || '',
      tags: typeof tags === 'string' ? tags.split(',').map(t => t.trim()).filter(Boolean) : (tags || []),
      coverImage: req.file ? `/uploads/${req.file.filename}` : (req.body.coverImage || null),
      status: status || 'draft',
      publishedAt: status === 'published' ? now : null,
      createdAt: now,
      updatedAt: now,
    };

    const data = await readJSON(FILE);
    data.posts = data.posts || [];
    data.posts.unshift(post);
    await writeJSON(FILE, data);
    return success(res, post, 'Post created');
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const data = await readJSON(FILE);
    const idx = (data.posts || []).findIndex(p => p.id === req.params.id);
    if (idx === -1) return notFound(res, 'Post not found');

    const existing = data.posts[idx];
    const { title, content, contentType, metaTitle, metaDescription, tags, status, coverImage } = req.body;
    const wasPublished = existing.status === 'published';
    const isPublishing = status === 'published' && !wasPublished;
    const now = new Date().toISOString();

    data.posts[idx] = {
      ...existing,
      ...(title         !== undefined && { title, slug: slugify(title) }),
      ...(content       !== undefined && { content }),
      ...(contentType   !== undefined && { contentType }),
      ...(metaTitle     !== undefined && { metaTitle }),
      ...(metaDescription !== undefined && { metaDescription }),
      ...(tags          !== undefined && {
        tags: typeof tags === 'string' ? tags.split(',').map(t => t.trim()).filter(Boolean) : tags,
      }),
      ...(status        !== undefined && { status }),
      ...(isPublishing  && { publishedAt: now }),
      ...(req.file      && { coverImage: `/uploads/${req.file.filename}` }),
      ...(!req.file && coverImage !== undefined && { coverImage }),
      updatedAt: now,
    };

    await writeJSON(FILE, data);
    return success(res, data.posts[idx]);
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const data = await readJSON(FILE);
    const idx = (data.posts || []).findIndex(p => p.id === req.params.id);
    if (idx === -1) return notFound(res, 'Post not found');

    // Cleanup cover image if stored locally
    const post = data.posts[idx];
    if (post.coverImage?.startsWith('/uploads/')) {
      const filePath = path.join(config.upload.uploadDir, path.basename(post.coverImage));
      await fs.unlink(filePath).catch(() => {});
    }

    data.posts.splice(idx, 1);
    await writeJSON(FILE, data);
    invalidateCache(FILE);
    return success(res, null, 'Post deleted');
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, getOne, create, update, remove };
