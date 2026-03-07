const authService = require('../../services/authService');
const { success, error } = require('../../utils/responseHelper');

const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password required' });
    }
    const result = await authService.login(username, password);
    return success(res, result, 'Login successful');
  } catch (err) {
    next(err);
  }
};

const getMe = async (req, res, next) => {
  try {
    const result = await authService.getMe(req.admin.username);
    return success(res, result);
  } catch (err) {
    next(err);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current and new password required' });
    }
    const result = await authService.changePassword(currentPassword, newPassword);
    return success(res, null, result.message);
  } catch (err) {
    next(err);
  }
};

module.exports = { login, getMe, changePassword };
