const fs = require('fs');
const os = require('os');
const path = require('path');
const { randomUUID } = require('crypto');
const { pipeline } = require('stream/promises');
const { Readable } = require('stream');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');

if (ffmpegPath) {
  ffmpeg.setFfmpegPath(ffmpegPath);
}

async function downloadTelegramFile(ctx, fileId, targetPath) {
  const fileLink = await ctx.telegram.getFileLink(fileId);
  const response = await fetch(fileLink.href);

  if (!response.ok || !response.body) {
    throw new Error(`Failed to download Telegram file: ${response.status} ${response.statusText}`);
  }

  await pipeline(Readable.fromWeb(response.body), fs.createWriteStream(targetPath));
}

function convertVideoToVoice(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .noVideo()
      .audioCodec('libopus')
      .audioChannels(1)
      .audioFrequency(48000)
      .audioBitrate('32k')
      .format('ogg')
      .outputOptions(['-application voip'])
      .on('end', resolve)
      .on('error', reject)
      .save(outputPath);
  });
}

async function removeTempFile(filePath) {
  if (!filePath) {
    return;
  }

  try {
    await fs.promises.rm(filePath, { force: true });
  } catch (error) {
    console.error('Failed to remove temporary media file:', {
      filePath,
      message: error.message,
    });
  }
}

async function createVoiceFromTelegramVideo(ctx, fileId) {
  const tempBase = path.join(os.tmpdir(), `voice-inline-${randomUUID()}`);
  const inputPath = `${tempBase}.input`;
  const outputPath = `${tempBase}.ogg`;

  try {
    await downloadTelegramFile(ctx, fileId, inputPath);
    await convertVideoToVoice(inputPath, outputPath);

    return {
      outputPath,
      cleanup: async () => {
        await removeTempFile(inputPath);
        await removeTempFile(outputPath);
      },
    };
  } catch (error) {
    await removeTempFile(inputPath);
    await removeTempFile(outputPath);
    throw error;
  }
}

module.exports = {
  createVoiceFromTelegramVideo,
};
