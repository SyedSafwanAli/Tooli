const revenueRepo = require('../repositories/revenueRepository');

async function getAll() {
  return revenueRepo.getAllEntries();
}

async function add(data) {
  if (!data.amount || isNaN(parseFloat(data.amount))) {
    throw Object.assign(new Error('Valid amount is required'), { statusCode: 400 });
  }
  if (!data.description || !data.description.trim()) {
    throw Object.assign(new Error('Description is required'), { statusCode: 400 });
  }
  return revenueRepo.addEntry(data);
}

async function update(id, data) {
  if (!id) throw Object.assign(new Error('ID required'), { statusCode: 400 });
  return revenueRepo.updateEntry(id, data);
}

async function remove(id) {
  if (!id) throw Object.assign(new Error('ID required'), { statusCode: 400 });
  return revenueRepo.deleteEntry(id);
}

async function getSummary(year, month) {
  return revenueRepo.getSummary({ year, month });
}

async function getCategories() {
  return revenueRepo.getCategories();
}

module.exports = { getAll, add, update, remove, getSummary, getCategories };
