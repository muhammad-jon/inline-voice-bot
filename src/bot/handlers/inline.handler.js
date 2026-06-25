const { searchVoices } = require('../../services/voice.service');

async function handleInlineQuery(ctx) {
  try {
    const voices = await searchVoices(ctx.inlineQuery.query || '');
    const results = voices.length
      ? voices.map((voice) => ({
          type: 'voice',
          id: String(voice.id),
          voice_file_id: voice.fileId,
          title: voice.title || 'Voice message',
        }))
      : [
          {
            type: 'article',
            id: 'no-results',
            title: 'Natija topilmadi',
            description: 'Boshqa kalit so\'z bilan urinib ko\'ring.',
            input_message_content: {
              message_text: 'Bu qidiruv bo\'yicha voice topilmadi.',
            },
          },
        ];

    await ctx.answerInlineQuery(results, {
      cache_time: 5,
      is_personal: true,
    });
  } catch (error) {
    console.error('Inline query failed:', {
      queryId: ctx.inlineQuery && ctx.inlineQuery.id,
      message: error.message,
    });

    try {
      await ctx.answerInlineQuery([], {
        cache_time: 1,
        is_personal: true,
      });
    } catch (answerError) {
      console.error('Failed to answer empty inline query:', answerError.message);
    }
  }
}

module.exports = {
  handleInlineQuery,
};
