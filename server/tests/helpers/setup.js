const createApp = require('../../src/app');
const { sequelize } = require('../../src/models');

async function setupTestApp() {
  await sequelize.sync({ force: true });
  return createApp();
}

module.exports = { setupTestApp, sequelize };
