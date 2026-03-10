const { readJSON, writeJSON } = require('../../repositories/adapters/jsonFileAdapter');
const config = require('../../config');
const { success, badRequest } = require('../../utils/responseHelper');

const FILE = config.data.toolsFile;

const getOverrides = async (req, res, next) => {
  try {
    const data = await readJSON(FILE);
    return success(res, data.overrides || {});
  } catch (err) {
    next(err);
  }
};

const updateOverride = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) return badRequest(res, 'Tool ID required');
    const { enabled, featured, title, description } = req.body;
    const data = await readJSON(FILE);
    data.overrides = data.overrides || {};
    data.overrides[id] = {
      ...data.overrides[id],
      ...(enabled !== undefined && { enabled }),
      ...(featured !== undefined && { featured }),
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
    };
    await writeJSON(FILE, data);
    return success(res, data.overrides[id]);
  } catch (err) {
    next(err);
  }
};

const deleteOverride = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await readJSON(FILE);
    data.overrides = data.overrides || {};
    delete data.overrides[id];
    await writeJSON(FILE, data);
    return success(res, null, 'Override removed');
  } catch (err) {
    next(err);
  }
};

module.exports = { getOverrides, updateOverride, deleteOverride };
