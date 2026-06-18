-- AlterTable
ALTER TABLE "Voice" ADD COLUMN "sourceFileId" TEXT;
ALTER TABLE "Voice" ADD COLUMN "sourceFileUniqueId" TEXT;
ALTER TABLE "Voice" ADD COLUMN "sourceType" TEXT NOT NULL DEFAULT 'VOICE';

-- AlterTable
ALTER TABLE "PendingVoice" ADD COLUMN "mediaType" TEXT NOT NULL DEFAULT 'VOICE';

-- CreateIndex
CREATE UNIQUE INDEX "Voice_sourceFileUniqueId_key" ON "Voice"("sourceFileUniqueId");
