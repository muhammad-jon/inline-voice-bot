const { Markup } = require('telegraf');

function pendingVoiceKeyboard() {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback('Bekor qilish', 'cancel_voice'),
    ],
  ]);
}

module.exports = {
  pendingVoiceKeyboard,
};
