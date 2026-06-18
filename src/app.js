const express = require('express');
const prisma = require('./lib/prisma');

function createApp() {
  const app = express();

  app.use(express.json());

  app.get('/', (req, res) => {
    res.json({
      success: true,
      message: 'Voice inline bot is running',
    });
  });

  app.get('/health', async (req, res, next) => {
    try {
      await prisma.$queryRaw`SELECT 1`;

      res.json({
        success: true,
        database: 'connected',
        bot: 'running',
      });
    } catch (error) {
      next(error);
    }
  });

  app.use((req, res) => {
    res.status(404).json({
      success: false,
      message: 'Not found',
    });
  });

  app.use((error, req, res, next) => {
    console.error('Express request failed:', {
      method: req.method,
      path: req.path,
      message: error.message,
    });

    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  });

  return app;
}

module.exports = createApp;
