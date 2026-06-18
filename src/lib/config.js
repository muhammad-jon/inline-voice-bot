require('dotenv').config({ quiet: true });

const requiredEnv = ['BOT_TOKEN', 'STORAGE_CHANNEL_ID'];

function validateConfig() {
  const missing = requiredEnv.filter((name) => !process.env[name] || !process.env[name].trim());

  if (missing.length > 0) {
    throw new Error(`Missing required environment variable(s): ${missing.join(', ')}`);
  }
}

const config = {
  botToken: process.env.BOT_TOKEN,
  storageChannelId: process.env.STORAGE_CHANNEL_ID,
  port: Number(process.env.PORT || 3000),
};

module.exports = {
  config,
  validateConfig,
};
