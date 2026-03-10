const { readJSON, writeJSON, invalidateCache } = require('../../repositories/adapters/jsonFileAdapter');
const config = require('../../config');
const { success, badRequest, notFound } = require('../../utils/responseHelper');
const { v4: uuidv4 } = require('uuid');

const FILE = config.data.guidesAdminFile;

function slugify(str) {
  return str.toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

const getAll = async (req, res, next) => {
  try {
    const data = await readJSON(FILE);
    return success(res, data.guides || []);
  } catch (err) {
    next(err);
  }
};

const getOne = async (req, res, next) => {
  try {
    const data = await readJSON(FILE);
    const guide = (data.guides || []).find(g => g.id === req.params.id || g.slug === req.params.id);
    if (!guide) return notFound(res, 'Guide not found');
    return success(res, guide);
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const { title, content, contentType, metaTitle, metaDescription, category, relatedTool, readTime, tags, status } = req.body;
    if (!title) return badRequest(res, 'Title is required');

    const now = new Date().toISOString();
    const guide = {
      id: uuidv4(),
      slug: slugify(title),
      title,
      content: content || '',
      contentType: contentType || 'markdown',
      metaTitle: metaTitle || title,
      metaDescription: metaDescription || '',
      category: category || 'Utility',
      relatedTool: relatedTool || null,
      readTime: parseInt(readTime) || 5,
      tags: typeof tags === 'string' ? tags.split(',').map(t => t.trim()).filter(Boolean) : (tags || []),
      status: status || 'draft',
      publishedAt: status === 'published' ? now : null,
      createdAt: now,
      updatedAt: now,
    };

    const data = await readJSON(FILE);
    data.guides = data.guides || [];
    data.guides.unshift(guide);
    await writeJSON(FILE, data);
    return success(res, guide, 'Guide created');
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const data = await readJSON(FILE);
    const idx = (data.guides || []).findIndex(g => g.id === req.params.id);
    if (idx === -1) return notFound(res, 'Guide not found');

    const existing = data.guides[idx];
    const { title, content, contentType, metaTitle, metaDescription, category, relatedTool, readTime, tags, status } = req.body;
    const isPublishing = status === 'published' && existing.status !== 'published';
    const now = new Date().toISOString();

    data.guides[idx] = {
      ...existing,
      ...(title       !== undefined && { title, slug: slugify(title) }),
      ...(content     !== undefined && { content }),
      ...(contentType !== undefined && { contentType }),
      ...(metaTitle   !== undefined && { metaTitle }),
      ...(metaDescription !== undefined && { metaDescription }),
      ...(category    !== undefined && { category }),
      ...(relatedTool !== undefined && { relatedTool }),
      ...(readTime    !== undefined && { readTime: parseInt(readTime) || 5 }),
      ...(tags        !== undefined && {
        tags: typeof tags === 'string' ? tags.split(',').map(t => t.trim()).filter(Boolean) : tags,
      }),
      ...(status      !== undefined && { status }),
      ...(isPublishing && { publishedAt: now }),
      updatedAt: now,
    };

    await writeJSON(FILE, data);
    return success(res, data.guides[idx]);
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const data = await readJSON(FILE);
    const idx = (data.guides || []).findIndex(g => g.id === req.params.id);
    if (idx === -1) return notFound(res, 'Guide not found');
    data.guides.splice(idx, 1);
    await writeJSON(FILE, data);
    invalidateCache(FILE);
    return success(res, null, 'Guide deleted');
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, getOne, create, update, remove };
