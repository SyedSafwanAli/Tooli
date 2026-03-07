const revenueService = require('../../services/revenueService');
const { success, created, error } = require('../../utils/responseHelper');

const getAll = async (req, res, next) => {
  try {
    const entries = await revenueService.getAll();
    return success(res, entries);
  } catch (err) {
    next(err);
  }
};

const add = async (req, res, next) => {
  try {
    const entry = await revenueService.add(req.body);
    return created(res, entry, 'Revenue entry added');
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const entry = await revenueService.update(req.params.id, req.body);
    return success(res, entry, 'Entry updated');
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const result = await revenueService.remove(req.params.id);
    return success(res, result, 'Entry deleted');
  } catch (err) {
    next(err);
  }
};

const getSummary = async (req, res, next) => {
  try {
    const { year, month } = req.query;
    const data = await revenueService.getSummary(year, month);
    return success(res, data);
  } catch (err) {
    next(err);
  }
};

const getCategories = async (req, res, next) => {
  try {
    const cats = await revenueService.getCategories();
    return success(res, cats);
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, add, update, remove, getSummary, getCategories };
