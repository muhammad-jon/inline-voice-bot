const {
  deletePendingVoice,
} = require('../../services/voice.service');

async function safeEditOrReply(ctx, message) {
  try {
    await ctx.editMessageText(message);
  } catch (error) {
    await ctx.reply(message);
  }
}

async function handleSaveWithoutText(ctx) {
  await ctx.answerCbQuery();

  await safeEditOrReply(
    ctx,
    "Voice saqlash uchun matn majburiy. Kamida 10 ta belgi yuboring yoki 'Bekor qilish' tugmasini bosing."
  );
}

async function handleCancelVoice(ctx) {
  await ctx.answerCbQuery();
  await deletePendingVoice(String(ctx.from.id));
  await safeEditOrReply(ctx, 'Voice saqlash bekor qilindi.');
}

module.exports = {
  handleSaveWithoutText,
  handleCancelVoice,
};
