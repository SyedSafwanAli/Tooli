const { readJSON, writeJSON, invalidateCache } = require('./adapters/jsonFileAdapter');
const config = require('../config');

const FILE = config.data.logsFile;

/**
 * Append a file processing log entry.
 * Never throws — log failures must not break tool requests.
 */
async function addLog(entry) {
  try {
    const data = await readJSON(FILE);
    data.entries = data.entries || [];
    data.entries.push({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      timestamp: new Date().toISOString(),
      ...entry,
    });
    // Cap at 1000 most recent entries
    if (data.entries.length > 1000) {
      data.entries = data.entries.slice(-1000);
    }
    invalidateCache(FILE);
    await writeJSON(FILE, data);
  } catch (_) {
    // Silently swallow — logging must never break a tool request
  }
}

module.exports = { addLog };
