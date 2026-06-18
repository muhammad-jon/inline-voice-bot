const http = require('http');
const createApp = require('./app');
const bot = require('./bot/bot');
const prisma = require('./lib/prisma');
const { config, validateConfig } = require('./lib/config');

let server;
let shuttingDown = false;

async function start() {
  validateConfig();

  const app = createApp();
  server = http.createServer(app);

  await new Promise((resolve) => {
    server.listen(config.port, resolve);
  });

  console.log(`Express server listening on port ${config.port}`);

  await bot.launch({
    dropPendingUpdates: false,
  });

  console.log('Telegram bot started with long polling');
}

async function shutdown(signal) {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;
  console.log(`Received ${signal}. Shutting down...`);

  try {
    bot.stop(signal);
  } catch (error) {
    console.error('Failed to stop Telegram bot cleanly:', error.message);
  }

  if (server) {
    await new Promise((resolve) => {
      server.close((error) => {
        if (error) {
          console.error('Failed to close Express server cleanly:', error.message);
        }

        resolve();
      });
    });
  }

  await prisma.$disconnect();
  process.exit(0);
}

process.once('SIGINT', () => shutdown('SIGINT'));
process.once('SIGTERM', () => shutdown('SIGTERM'));

start().catch(async (error) => {
  console.error('Startup failed:', error.message);

  try {
    await prisma.$disconnect();
  } catch (disconnectError) {
    console.error('Failed to disconnect Prisma after startup error:', disconnectError.message);
  }

  process.exit(1);
});
