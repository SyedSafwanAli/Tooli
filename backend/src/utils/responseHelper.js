/**
 * Standardised API response shapes.
 * Every endpoint returns { success, data?, message?, errors? }
 */

const success = (res, data = null, message = 'OK', statusCode = 200) => {
  return res.status(statusCode).json({ success: true, data, message });
};

const created = (res, data, message = 'Created') => success(res, data, message, 201);

const error = (res, message = 'Internal server error', statusCode = 500, errors = null) => {
  const body = { success: false, message };
  if (errors) body.errors = errors;
  return res.status(statusCode).json(body);
};

const notFound = (res, message = 'Not found') => error(res, message, 404);
const badRequest = (res, message = 'Bad request', errors = null) => error(res, message, 400, errors);
const unauthorized = (res, message = 'Unauthorized') => error(res, message, 401);
const forbidden = (res, message = 'Forbidden') => error(res, message, 403);

module.exports = { success, created, error, notFound, badRequest, unauthorized, forbidden };
