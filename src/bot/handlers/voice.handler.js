const { pendingVoiceKeyboard } = require('../keyboards');
const { upsertPendingVoice } = require('../../services/voice.service');

async function handleVoice(ctx) {
  if (ctx.chat.type !== 'private') {
    await ctx.reply('Iltimos, voice xabarni botning shaxsiy chatiga yuboring.');
    return;
  }

  const voice = ctx.message.voice;
  const user = ctx.from;

  await upsertPendingVoice({
    telegramId: String(user.id),
    voice,
    uploaderUsername: user.username || null,
    uploaderFirstName: user.first_name || null,
  });

  await ctx.reply(
    [
      'Voice qabul qilindi.',
      '',
      'Endi sarlavha yoki qidiruv kalit so‘zlarini yuboring.',
      '',
      'Masalan:',
      'Assalomu alaykum greeting hello',
    ].join('\n'),
    pendingVoiceKeyboard()
  );
}

module.exports = {
  handleVoice,
};
