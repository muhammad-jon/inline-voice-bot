const {
  deletePendingVoice,
  persistPendingVoice,
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

  const result = await persistPendingVoice(ctx, String(ctx.from.id), {
    title: 'Voice message',
    searchText: null,
  });

  if (result.status === 'missing_pending') {
    await safeEditOrReply(ctx, 'Saqlash uchun voice topilmadi. Avval voice xabar yuboring.');
    return;
  }

  if (result.status === 'duplicate') {
    await safeEditOrReply(ctx, 'Bu voice avval saqlangan. Dublikat yaratilmadi.');
    return;
  }

  if (result.status === 'failed') {
    await safeEditOrReply(ctx, 'Voice saqlanmadi. Iltimos, keyinroq qayta urinib ko‘ring.');
    return;
  }

  await safeEditOrReply(ctx, 'Voice matnsiz muvaffaqiyatli saqlandi.');
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
