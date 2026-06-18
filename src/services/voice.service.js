const prisma = require('../lib/prisma');
const { saveVoiceToStorageChannel, deleteStorageMessage } = require('./storage-channel.service');

const MAX_SEARCH_TEXT_LENGTH = 200;
const MAX_INLINE_QUERY_LENGTH = 100;

function normalizeSearchText(text) {
  return text.trim().toLowerCase();
}

function buildTitle(text) {
  const trimmed = text.trim();
  return trimmed.length > 80 ? trimmed.slice(0, 80) : trimmed;
}

function isCommandText(text) {
  return text.trim().startsWith('/');
}

async function upsertPendingVoice({ telegramId, voice, mediaType = 'VOICE', uploaderUsername, uploaderFirstName }) {
  return prisma.pendingVoice.upsert({
    where: { telegramId },
    update: {
      originalFileId: voice.file_id,
      originalFileUniqueId: voice.file_unique_id,
      mediaType,
      duration: voice.duration || null,
      uploaderUsername,
      uploaderFirstName,
      createdAt: new Date(),
    },
    create: {
      telegramId,
      originalFileId: voice.file_id,
      originalFileUniqueId: voice.file_unique_id,
      mediaType,
      duration: voice.duration || null,
      uploaderUsername,
      uploaderFirstName,
    },
  });
}

async function getPendingVoice(telegramId) {
  return prisma.pendingVoice.findUnique({
    where: { telegramId },
  });
}

async function deletePendingVoice(telegramId) {
  return prisma.pendingVoice.deleteMany({
    where: { telegramId },
  });
}

async function findDuplicateVoice(fileUniqueId) {
  return prisma.voice.findFirst({
    where: {
      OR: [
        { fileUniqueId },
        { sourceFileUniqueId: fileUniqueId },
      ],
    },
  });
}

function extractStoredVoice(sentMessage, fallbackPendingVoice) {
  const storedVoice = sentMessage.voice;

  if (!storedVoice) {
    throw new Error('Telegram storage channel response did not include a voice payload.');
  }

  return {
    fileId: storedVoice.file_id || fallbackPendingVoice.originalFileId,
    fileUniqueId: storedVoice.file_unique_id || fallbackPendingVoice.originalFileUniqueId,
    duration: storedVoice.duration || fallbackPendingVoice.duration || null,
  };
}

async function persistPendingVoice(ctx, telegramId, { title, searchText }) {
  const pendingVoice = await getPendingVoice(telegramId);

  if (!pendingVoice) {
    return { status: 'missing_pending' };
  }

  const duplicate = await findDuplicateVoice(pendingVoice.originalFileUniqueId);

  if (duplicate) {
    await deletePendingVoice(telegramId);
    return { status: 'duplicate' };
  }

  let sentMessage;

  try {
    sentMessage = await saveVoiceToStorageChannel(ctx, pendingVoice, {
      title,
      searchText,
    });

    const storedVoice = extractStoredVoice(sentMessage, pendingVoice);

    const savedVoice = await prisma.voice.create({
      data: {
        fileId: storedVoice.fileId,
        fileUniqueId: storedVoice.fileUniqueId,
        sourceFileId: pendingVoice.originalFileId,
        sourceFileUniqueId: pendingVoice.originalFileUniqueId,
        sourceType: pendingVoice.mediaType || 'VOICE',
        channelMessageId: sentMessage.message_id,
        channelChatId: String(sentMessage.chat.id),
        title,
        searchText,
        uploaderTelegramId: pendingVoice.telegramId,
        uploaderUsername: pendingVoice.uploaderUsername,
        uploaderFirstName: pendingVoice.uploaderFirstName,
        duration: storedVoice.duration,
        status: 'ACTIVE',
      },
    });

    await deletePendingVoice(telegramId);

    return { status: 'saved', voice: savedVoice };
  } catch (error) {
    console.error('Failed to save voice:', {
      telegramId,
      storageMessageId: sentMessage && sentMessage.message_id,
      message: error.message,
    });

    if (sentMessage) {
      await deleteStorageMessage(ctx, sentMessage.chat.id, sentMessage.message_id);
    }

    return { status: 'failed' };
  }
}

async function searchVoices(rawQuery) {
  const normalizedQuery = normalizeSearchText(rawQuery).slice(0, MAX_INLINE_QUERY_LENGTH);

  if (!normalizedQuery) {
    return prisma.voice.findMany({
      where: { status: 'ACTIVE' },
      orderBy: [{ usageCount: 'desc' }, { createdAt: 'desc' }],
      take: 30,
    });
  }

  const startsWithMatches = await prisma.voice.findMany({
    where: {
      status: 'ACTIVE',
      OR: [
        { title: { startsWith: normalizedQuery } },
        { searchText: { startsWith: normalizedQuery } },
      ],
    },
    orderBy: [{ usageCount: 'desc' }, { createdAt: 'desc' }],
    take: 30,
  });

  if (startsWithMatches.length >= 30) {
    return startsWithMatches;
  }

  const existingIds = startsWithMatches.map((voice) => voice.id);
  const containsMatches = await prisma.voice.findMany({
    where: {
      status: 'ACTIVE',
      id: existingIds.length ? { notIn: existingIds } : undefined,
      OR: [
        { title: { contains: normalizedQuery } },
        { searchText: { contains: normalizedQuery } },
      ],
    },
    orderBy: [{ usageCount: 'desc' }, { createdAt: 'desc' }],
    take: 30 - startsWithMatches.length,
  });

  return [...startsWithMatches, ...containsMatches];
}

async function incrementUsageCount(id) {
  const voiceId = Number(id);

  if (!Number.isInteger(voiceId) || voiceId <= 0) {
    return null;
  }

  try {
    return await prisma.voice.update({
      where: { id: voiceId },
      data: { usageCount: { increment: 1 } },
    });
  } catch (error) {
    if (error.code !== 'P2025') {
      console.error('Failed to increment inline usage count:', {
        resultId: id,
        message: error.message,
      });
    }

    return null;
  }
}

module.exports = {
  MAX_SEARCH_TEXT_LENGTH,
  MAX_INLINE_QUERY_LENGTH,
  normalizeSearchText,
  buildTitle,
  isCommandText,
  upsertPendingVoice,
  getPendingVoice,
  deletePendingVoice,
  persistPendingVoice,
  searchVoices,
  incrementUsageCount,
};
