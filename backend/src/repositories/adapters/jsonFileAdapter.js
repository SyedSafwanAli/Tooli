/**
 * JSON File Adapter
 * Provides read/write operations against JSON files.
 * Swap this adapter for a DB adapter (MongoDB, PostgreSQL) without changing
 * any repository or service logic.
 */

const fs = require('fs').promises;
const path = require('path');
const config = require('../../config');

// In-memory cache to reduce disk I/O
const cache = new Map();

async function ensureDir(dirPath) {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (_) {}
}

async function initDataFiles() {
  await ensureDir(config.data.dir);
  await ensureDir(config.upload.uploadDir);

  const defaults = {
    [config.data.analyticsFile]: { pageViews: [], toolUsage: {}, dailySummary: [] },
    [config.data.revenueFile]: { entries: [], categories: [] },
    [config.data.adminFile]: { username: config.admin.username, passwordHash: null },
  };

  for (const [filePath, defaultData] of Object.entries(defaults)) {
    try {
      await fs.access(filePath);
    } catch {
      await fs.writeFile(filePath, JSON.stringify(defaultData, null, 2));
    }
  }

  console.log('✅ Data files initialized');
}

async function readJSON(filePath) {
  if (cache.has(filePath)) {
    return cache.get(filePath);
  }
  try {
    const raw = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(raw);
    cache.set(filePath, data);
    return data;
  } catch (err) {
    throw new Error(`Failed to read ${path.basename(filePath)}: ${err.message}`);
  }
}

async function writeJSON(filePath, data) {
  cache.set(filePath, data);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

// Invalidate cache entry (call after writes from external sources)
function invalidateCache(filePath) {
  cache.delete(filePath);
}

module.exports = { initDataFiles, readJSON, writeJSON, invalidateCache };
