-- CreateTable
CREATE TABLE "Voice" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fileId" TEXT NOT NULL,
    "fileUniqueId" TEXT NOT NULL,
    "channelMessageId" INTEGER NOT NULL,
    "channelChatId" TEXT NOT NULL,
    "title" TEXT,
    "searchText" TEXT,
    "uploaderTelegramId" TEXT NOT NULL,
    "uploaderUsername" TEXT,
    "uploaderFirstName" TEXT,
    "duration" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PendingVoice" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "telegramId" TEXT NOT NULL,
    "originalFileId" TEXT NOT NULL,
    "originalFileUniqueId" TEXT NOT NULL,
    "duration" INTEGER,
    "uploaderUsername" TEXT,
    "uploaderFirstName" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "Voice_fileUniqueId_key" ON "Voice"("fileUniqueId");

-- CreateIndex
CREATE INDEX "Voice_status_usageCount_createdAt_idx" ON "Voice"("status", "usageCount", "createdAt");

-- CreateIndex
CREATE INDEX "Voice_title_idx" ON "Voice"("title");

-- CreateIndex
CREATE INDEX "Voice_searchText_idx" ON "Voice"("searchText");

-- CreateIndex
CREATE UNIQUE INDEX "PendingVoice_telegramId_key" ON "PendingVoice"("telegramId");
