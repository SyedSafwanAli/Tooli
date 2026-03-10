const { readJSON, writeJSON, invalidateCache } = require('../../repositories/adapters/jsonFileAdapter');
const config = require('../../config');
const { success } = require('../../utils/responseHelper');

const FILE = config.data.logsFile;

const getLogs = async (req, res, next) => {
  try {
    const data = await readJSON(FILE);
    const all = data.entries || [];
    const entries = all.slice(-200).reverse();
    return success(res, { entries, total: all.length });
  } catch (err) {
    next(err);
  }
};

const clearLogs = async (req, res, next) => {
  try {
    invalidateCache(FILE);
    await writeJSON(FILE, { entries: [] });
    return success(res, null, 'Logs cleared');
  } catch (err) {
    next(err);
  }
};

module.exports = { getLogs, clearLogs };
