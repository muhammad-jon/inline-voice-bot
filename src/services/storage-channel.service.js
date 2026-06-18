const { config } = require('../lib/config');

function formatUploader(username, telegramId) {
  return username ? `@${username}` : `Telegram ID ${telegramId}`;
}

function buildVoiceCaption({ title, searchText, uploaderUsername, uploaderTelegramId }) {
  const lines = [
    `Title: ${title || 'Voice message'}`,
    `Uploader: ${formatUploader(uploaderUsername, uploaderTelegramId)}`,
    `Telegram ID: ${uploaderTelegramId}`,
  ];

  if (searchText) {
    lines.splice(1, 0, `Search: ${searchText}`);
  }

  return lines.join('\n');
}

async function saveVoiceToStorageChannel(ctx, pendingVoice, metadata) {
  const caption = buildVoiceCaption({
    title: metadata.title,
    searchText: metadata.searchText,
    uploaderUsername: pendingVoice.uploaderUsername,
    uploaderTelegramId: pendingVoice.telegramId,
  });

  return ctx.telegram.sendVoice(config.storageChannelId, pendingVoice.originalFileId, {
    caption,
  });
}

async function deleteStorageMessage(ctx, chatId, messageId) {
  try {
    await ctx.telegram.deleteMessage(chatId, messageId);
  } catch (error) {
    console.error('Failed to delete orphan storage channel message:', {
      chatId,
      messageId,
      message: error.message,
    });
  }
}

module.exports = {
  saveVoiceToStorageChannel,
  deleteStorageMessage,
};
