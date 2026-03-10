const os = require('os');
const { success } = require('../../utils/responseHelper');

const getHealth = async (req, res, next) => {
  try {
    const mem = process.memoryUsage();
    const uptime = process.uptime();

    return success(res, {
      uptime: Math.floor(uptime),
      memory: {
        heapUsed: Math.round(mem.heapUsed / 1024 / 1024),
        heapTotal: Math.round(mem.heapTotal / 1024 / 1024),
        rss: Math.round(mem.rss / 1024 / 1024),
        external: Math.round(mem.external / 1024 / 1024),
      },
      os: {
        platform: process.platform,
        nodeVersion: process.version,
        totalMem: Math.round(os.totalmem() / 1024 / 1024),
        freeMem: Math.round(os.freemem() / 1024 / 1024),
        cpuCount: os.cpus().length,
        loadAvg: os.loadavg(),
      },
      env: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getHealth };
