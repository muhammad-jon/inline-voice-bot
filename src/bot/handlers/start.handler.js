function getInlineExample(ctx) {
  const username = ctx.botInfo && ctx.botInfo.username ? ctx.botInfo.username : 'your_bot_username';
  return `@${username} soz`;
}

async function handleStart(ctx) {
  await ctx.reply(
    [
      'Assalomu alaykum!',
      '',
      'Bu bot orqali voice xabarlarni saqlab, keyin inline qidiruv orqali istalgan chatga yuborishingiz mumkin.',
      '',
      'Voice yuboring yoki video/video note yuboring. Video yuborilsa, bot undagi ovozni voice formatiga aylantiradi.',
      '',
      '1. Botga shaxsiy chatda voice yoki video yuboring.',
      '2. Bot sizdan kamida 10 ta belgidan iborat sarlavha yoki qidiruv sozlarini soraydi.',
      '3. Tayyor voice xususiy saqlash kanaliga joylanadi va SQLite bazasida indekslanadi.',
      '',
      'Keyin istalgan chatda shunday yozing:',
      getInlineExample(ctx),
      '',
      'Inline natijalarda voice xabarni yuborishdan oldin tinglab korishingiz mumkin.',
    ].join('\n')
  );
}

async function handleHelp(ctx) {
  await ctx.reply(
    [
      'Foydalanish boyicha qollanma:',
      '',
      'Voice qoshish:',
      'Botga shaxsiy chatda Telegram voice xabar yuboring.',
      '',
      'Videodan voice qoshish:',
      'Botga video yoki video note yuboring. Saqlash vaqtida video ichidagi audio voice formatiga aylantiriladi.',
      '',
      'Qidiruv sozlari:',
      'Media yuborgandan keyin kamida 10 ta belgidan iborat sarlavha yoki kalit sozlarni yozing. Masalan: Assalomu alaykum greeting hello',
      '',
      'Bekor qilish:',
      '"Bekor qilish" tugmasini bosing yoki /cancel yozing.',
      '',
      'Inline qidiruv:',
      `Istalgan Telegram chatida ${getInlineExample(ctx)} deb yozing.`,
      '',
      'Preview va yuborish:',
      'Inline natijalarda voice xabarni tinglab korib, keraklisini tanlang.',
    ].join('\n')
  );
}

module.exports = {
  handleStart,
  handleHelp,
};
