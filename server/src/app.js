const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const categoriesRoutes = require('./routes/categories.routes');
const transactionsRoutes = require('./routes/transactions.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const reportsRoutes = require('./routes/reports.routes');
const errorHandler = require('./middleware/errorHandler');

function createApp() {
  const app = express();

  app.use(express.json());
  app.use(cookieParser());

  if (process.env.CLIENT_ORIGIN) {
    app.use(cors({ origin: process.env.CLIENT_ORIGIN, credentials: true }));
  }

  app.use('/api/auth', authRoutes);
  app.use('/api/categories', categoriesRoutes);
  app.use('/api/transactions', transactionsRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/reports', reportsRoutes);

  app.use('/api', (req, res) => {
    res.status(404).json({ code: 'NOT_FOUND', message: 'Resource not found' });
  });

  app.use(errorHandler);

  return app;
}

module.exports = createApp;
