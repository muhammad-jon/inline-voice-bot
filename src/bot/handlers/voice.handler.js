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
    mediaType: 'VOICE',
    uploaderUsername: user.username || null,
    uploaderFirstName: user.first_name || null,
  });

  await ctx.reply(
    [
      'Voice qabul qilindi.',
      '',
      'Endi sarlavha yoki qidiruv kalit sozlarini yuboring.',
      '',
      'Masalan:',
      'Assalomu alaykum greeting hello',
    ].join('\n'),
    pendingVoiceKeyboard()
  );
}

async function handleVideoAsVoice(ctx) {
  if (ctx.chat.type !== 'private') {
    await ctx.reply('Iltimos, video xabarni botning shaxsiy chatiga yuboring.');
    return;
  }

  const media = ctx.message.video || ctx.message.video_note;
  const mediaType = ctx.message.video_note ? 'VIDEO_NOTE' : 'VIDEO';
  const user = ctx.from;

  await upsertPendingVoice({
    telegramId: String(user.id),
    voice: media,
    mediaType,
    uploaderUsername: user.username || null,
    uploaderFirstName: user.first_name || null,
  });

  await ctx.reply(
    [
      'Video qabul qilindi.',
      '',
      'Saqlash vaqtida videodagi ovoz voice formatiga aylantiriladi.',
      'Endi sarlavha yoki qidiruv kalit sozlarini yuboring.',
      '',
      'Masalan:',
      'kulgi hazil funny',
    ].join('\n'),
    pendingVoiceKeyboard()
  );
}

module.exports = {
  handleVoice,
  handleVideoAsVoice,
};
