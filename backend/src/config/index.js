const path = require('path');

module.exports = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT) || 5000,

  jwt: {
    secret: process.env.JWT_SECRET || 'fallback_secret_change_me',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  admin: {
    username: process.env.ADMIN_USERNAME || 'admin',
    password: process.env.ADMIN_PASSWORD || 'admin123',
  },

  cors: {
    origins: (process.env.ALLOWED_ORIGINS || 'http://localhost:5173').split(','),
  },

  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
    uploadDir: path.join(__dirname, '../../uploads'),
  },

  data: {
    dir: path.join(__dirname, '../../data'),
    analyticsFile: path.join(__dirname, '../../data/analytics.json'),
    revenueFile: path.join(__dirname, '../../data/revenue.json'),
    adminFile: path.join(__dirname, '../../data/admin.json'),
    toolsFile: path.join(__dirname, '../../data/tools.json'),
    logsFile: path.join(__dirname, '../../data/logs.json'),
    seoFile: path.join(__dirname, '../../data/seo.json'),
    blogFile: path.join(__dirname, '../../data/blog.json'),
    guidesAdminFile: path.join(__dirname, '../../data/guidesAdmin.json'),
  },
};
