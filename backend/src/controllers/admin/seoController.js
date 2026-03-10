const { readJSON, writeJSON } = require('../../repositories/adapters/jsonFileAdapter');
const config = require('../../config');
const { success, badRequest } = require('../../utils/responseHelper');

const FILE = config.data.seoFile;

const getMeta = async (req, res, next) => {
  try {
    const data = await readJSON(FILE);
    return success(res, data.meta || {});
  } catch (err) {
    next(err);
  }
};

const updateMeta = async (req, res, next) => {
  try {
    const { path: pagePath, title, description } = req.body;
    if (!pagePath) return badRequest(res, 'Path required');
    const data = await readJSON(FILE);
    data.meta = data.meta || {};
    data.meta[pagePath] = { title: title || '', description: description || '' };
    await writeJSON(FILE, data);
    return success(res, data.meta[pagePath]);
  } catch (err) {
    next(err);
  }
};

const deleteMeta = async (req, res, next) => {
  try {
    const pagePath = decodeURIComponent(req.params.path);
    const data = await readJSON(FILE);
    data.meta = data.meta || {};
    delete data.meta[pagePath];
    await writeJSON(FILE, data);
    return success(res, null, 'Meta removed');
  } catch (err) {
    next(err);
  }
};

module.exports = { getMeta, updateMeta, deleteMeta };
