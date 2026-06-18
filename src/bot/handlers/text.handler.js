const {
  MAX_SEARCH_TEXT_LENGTH,
  buildTitle,
  deletePendingVoice,
  isCommandText,
  normalizeSearchText,
  persistPendingVoice,
} = require('../../services/voice.service');

async function handleText(ctx) {
  const text = ctx.message.text || '';

  if (isCommandText(text)) {
    return;
  }

  if (ctx.chat.type !== 'private') {
    return;
  }

  const trimmed = text.trim();

  if (!trimmed) {
    await ctx.reply('Matn bo‘sh bo‘lmasligi kerak. Qidiruv so‘zlarini yuboring yoki /cancel yozing.');
    return;
  }

  if (trimmed.length > MAX_SEARCH_TEXT_LENGTH) {
    await ctx.reply(`Matn juda uzun. Iltimos, ${MAX_SEARCH_TEXT_LENGTH} ta belgidan oshirmang.`);
    return;
  }

  const result = await persistPendingVoice(ctx, String(ctx.from.id), {
    title: buildTitle(trimmed),
    searchText: normalizeSearchText(trimmed),
  });

  if (result.status === 'missing_pending') {
    await ctx.reply('Avval voice xabar yuboring, keyin qidiruv so‘zlarini yozing.');
    return;
  }

  if (result.status === 'duplicate') {
    await ctx.reply('Bu voice avval saqlangan. Dublikat yaratilmadi.');
    return;
  }

  if (result.status === 'failed') {
    await ctx.reply('Voice saqlanmadi. Iltimos, keyinroq qayta urinib ko‘ring.');
    return;
  }

  await ctx.reply('Voice muvaffaqiyatli saqlandi. Endi uni inline qidiruv orqali topishingiz mumkin.');
}

async function handleCancelCommand(ctx) {
  await deletePendingVoice(String(ctx.from.id));
  await ctx.reply('Voice saqlash bekor qilindi.');
}

module.exports = {
  handleText,
  handleCancelCommand,
};
