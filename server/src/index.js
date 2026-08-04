require('dotenv').config();
const path = require('path');
const fs = require('fs');
const express = require('express');
const createApp = require('./app');
const { sequelize } = require('./models');

const PORT = process.env.PORT || 3000;
const CLIENT_DIST = path.join(__dirname, '..', '..', 'client', 'dist');

async function start() {
  await sequelize.sync();

  const app = createApp();

  if (fs.existsSync(CLIENT_DIST)) {
    app.use(express.static(CLIENT_DIST));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api')) return next();
      res.sendFile(path.join(CLIENT_DIST, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Accounting Book server listening on port ${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
