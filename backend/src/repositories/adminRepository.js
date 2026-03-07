/**
 * Admin Repository
 * Single admin user — stored in JSON file.
 */

const { readJSON, writeJSON } = require('./adapters/jsonFileAdapter');
const bcrypt = require('bcryptjs');
const config = require('../config');

const FILE = config.data.adminFile;

async function getAdmin() {
  const data = await readJSON(FILE);

  // Bootstrap: if no passwordHash, hash the default password and save
  if (!data.passwordHash) {
    const hash = await bcrypt.hash(config.admin.password, 12);
    data.username = config.admin.username;
    data.passwordHash = hash;
    await writeJSON(FILE, data);
  }

  return data;
}

async function verifyPassword(plainPassword) {
  const admin = await getAdmin();
  return bcrypt.compare(plainPassword, admin.passwordHash);
}

async function updatePassword(newPassword) {
  const data = await readJSON(FILE);
  data.passwordHash = await bcrypt.hash(newPassword, 12);
  await writeJSON(FILE, data);
}

async function updateUsername(newUsername) {
  const data = await readJSON(FILE);
  data.username = newUsername;
  await writeJSON(FILE, data);
}

module.exports = { getAdmin, verifyPassword, updatePassword, updateUsername };
