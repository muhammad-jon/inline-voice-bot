const { Telegraf } = require('telegraf');
const { config } = require('../lib/config');
const { handleStart, handleHelp } = require('./handlers/start.handler');
const { handleVoice } = require('./handlers/voice.handler');
const { handleText, handleCancelCommand } = require('./handlers/text.handler');
const { handleSaveWithoutText, handleCancelVoice } = require('./handlers/action.handler');
const { handleInlineQuery } = require('./handlers/inline.handler');
const { handleChosenInlineResult } = require('./handlers/chosen-inline.handler');

const bot = new Telegraf(config.botToken);

bot.start(handleStart);
bot.help(handleHelp);
bot.command('cancel', handleCancelCommand);
bot.on('voice', handleVoice);
bot.on('text', handleText);
bot.action('save_without_text', handleSaveWithoutText);
bot.action('cancel_voice', handleCancelVoice);
bot.on('inline_query', handleInlineQuery);
bot.on('chosen_inline_result', handleChosenInlineResult);

bot.catch(async (error, ctx) => {
  console.error('Telegram bot handler failed:', {
    updateType: ctx && ctx.updateType,
    updateId: ctx && ctx.update && ctx.update.update_id,
    message: error.message,
  });

  try {
    if (ctx && ctx.chat) {
      await ctx.reply('Xatolik yuz berdi. Iltimos, keyinroq qayta urinib ko‘ring.');
    }
  } catch (replyError) {
    console.error('Failed to send user-friendly Telegram error:', replyError.message);
  }
});

module.exports = bot;
