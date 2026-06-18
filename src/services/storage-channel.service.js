const { config } = require('../lib/config');
const { Input } = require('telegraf');
const { createVoiceFromTelegramVideo } = require('./media-conversion.service');

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

  if (pendingVoice.mediaType === 'VOICE') {
    return ctx.telegram.sendVoice(config.storageChannelId, pendingVoice.originalFileId, {
      caption,
    });
  }

  const convertedVoice = await createVoiceFromTelegramVideo(ctx, pendingVoice.originalFileId);

  try {
    return await ctx.telegram.sendVoice(
      config.storageChannelId,
      Input.fromLocalFile(convertedVoice.outputPath, 'voice.ogg'),
      { caption }
    );
  } finally {
    await convertedVoice.cleanup();
  }
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
