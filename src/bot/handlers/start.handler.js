async function handleStart(ctx) {
  await ctx.reply(
    [
      'Assalomu alaykum!',
      '',
      'Bu bot orqali ovozli xabarlaringizni saqlab, keyin ularni inline qidiruv orqali istalgan chatga yuborishingiz mumkin.',
      '',
      '1. Botga shaxsiy chatda voice yuboring.',
      '2. Bot sizdan sarlavha yoki qidiruv so‘zlarini so‘raydi.',
      '3. Voice xususiy saqlash kanaliga joylanadi va SQLite bazasida indekslanadi.',
      '',
      'Keyin istalgan chatda shunday yozing:',
      '@botusername qidiruv so‘zlari',
      '',
      'Inline natijalarda voice xabarni yuborishdan oldin tinglab ko‘rishingiz mumkin.'
    ].join('\n')
  );
}

async function handleHelp(ctx) {
  await ctx.reply(
    [
      'Foydalanish bo‘yicha qo‘llanma:',
      '',
      'Voice qo‘shish:',
      'Botga shaxsiy chatda Telegram voice xabar yuboring.',
      '',
      'Qidiruv so‘zlari:',
      'Voice yuborgandan keyin sarlavha yoki kalit so‘zlarni yozing. Masalan: Assalomu alaykum greeting hello',
      '',
      'Matnsiz saqlash:',
      'Voice yuborgandan keyin “Matnsiz saqlash” tugmasini bosing.',
      '',
      'Bekor qilish:',
      '“Bekor qilish” tugmasini bosing yoki /cancel yozing.',
      '',
      'Inline qidiruv:',
      'Istalgan Telegram chatida @botusername so‘z deb yozing.',
      '',
      'Preview va yuborish:',
      'Inline natijalarda voice xabarni tinglab ko‘rib, keraklisini tanlang.'
    ].join('\n')
  );
}

module.exports = {
  handleStart,
  handleHelp,
};
