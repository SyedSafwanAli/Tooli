require('dotenv').config();
const app = require('./src/app');
const { initDataFiles } = require('./src/repositories/adapters/jsonFileAdapter');

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await initDataFiles();
    app.listen(PORT, () => {
      console.log(`\n🚀 Tooli server running on port ${PORT}`);
      console.log(`   Mode    : ${process.env.NODE_ENV}`);
      console.log(`   API     : http://localhost:${PORT}/api`);
      console.log(`   Admin   : http://localhost:${PORT}/api/admin\n`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
