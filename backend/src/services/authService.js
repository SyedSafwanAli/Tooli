const jwt = require('jsonwebtoken');
const adminRepo = require('../repositories/adminRepository');
const config = require('../config');

async function login(username, password) {
  const admin = await adminRepo.getAdmin();

  if (username !== admin.username) {
    throw Object.assign(new Error('Invalid credentials'), { statusCode: 401 });
  }

  const valid = await adminRepo.verifyPassword(password);
  if (!valid) {
    throw Object.assign(new Error('Invalid credentials'), { statusCode: 401 });
  }

  const token = jwt.sign(
    { username: admin.username, role: 'admin' },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );

  return { token, username: admin.username };
}

async function getMe(username) {
  const admin = await adminRepo.getAdmin();
  return { username: admin.username };
}

async function changePassword(currentPassword, newPassword) {
  const valid = await adminRepo.verifyPassword(currentPassword);
  if (!valid) {
    throw Object.assign(new Error('Current password is incorrect'), { statusCode: 400 });
  }
  if (newPassword.length < 6) {
    throw Object.assign(new Error('New password must be at least 6 characters'), { statusCode: 400 });
  }
  await adminRepo.updatePassword(newPassword);
  return { message: 'Password updated' };
}

module.exports = { login, getMe, changePassword };
