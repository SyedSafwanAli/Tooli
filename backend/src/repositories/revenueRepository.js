/**
 * Revenue Repository
 * Manual revenue entry storage.
 * DB-agnostic interface — swap adapter without touching services.
 */

const { readJSON, writeJSON } = require('./adapters/jsonFileAdapter');
const config = require('../config');
const { v4: uuidv4 } = require('uuid');

const FILE = config.data.revenueFile;

async function getAllEntries() {
  const data = await readJSON(FILE);
  return data.entries || [];
}

async function addEntry({ amount, description, category, date }) {
  const data = await readJSON(FILE);
  const entry = {
    id: uuidv4(),
    amount: parseFloat(amount),
    description: description || '',
    category: category || 'Other',
    date: date || new Date().toISOString().slice(0, 10),
    createdAt: new Date().toISOString(),
  };
  data.entries.push(entry);

  // Track unique categories
  if (!data.categories.includes(entry.category)) {
    data.categories.push(entry.category);
  }

  await writeJSON(FILE, data);
  return entry;
}

async function updateEntry(id, updates) {
  const data = await readJSON(FILE);
  const idx = data.entries.findIndex(e => e.id === id);
  if (idx === -1) throw new Error('Entry not found');

  data.entries[idx] = {
    ...data.entries[idx],
    ...updates,
    amount: parseFloat(updates.amount || data.entries[idx].amount),
    updatedAt: new Date().toISOString(),
  };

  await writeJSON(FILE, data);
  return data.entries[idx];
}

async function deleteEntry(id) {
  const data = await readJSON(FILE);
  const idx = data.entries.findIndex(e => e.id === id);
  if (idx === -1) throw new Error('Entry not found');

  data.entries.splice(idx, 1);
  await writeJSON(FILE, data);
  return { id };
}

async function getSummary({ year, month } = {}) {
  const entries = await getAllEntries();

  let filtered = entries;
  if (year) filtered = filtered.filter(e => e.date.startsWith(String(year)));
  if (month) {
    const mm = String(month).padStart(2, '0');
    filtered = filtered.filter(e => e.date.slice(0, 7) === `${year}-${mm}`);
  }

  const total = filtered.reduce((s, e) => s + e.amount, 0);

  // Group by month
  const byMonth = {};
  filtered.forEach(e => {
    const ym = e.date.slice(0, 7);
    byMonth[ym] = (byMonth[ym] || 0) + e.amount;
  });

  // Group by category
  const byCategory = {};
  filtered.forEach(e => {
    byCategory[e.category] = (byCategory[e.category] || 0) + e.amount;
  });

  return {
    total,
    count: filtered.length,
    byMonth: Object.entries(byMonth).sort().map(([month, amount]) => ({ month, amount })),
    byCategory: Object.entries(byCategory).map(([category, amount]) => ({ category, amount })),
  };
}

async function getCategories() {
  const data = await readJSON(FILE);
  return data.categories || [];
}

module.exports = { getAllEntries, addEntry, updateEntry, deleteEntry, getSummary, getCategories };
