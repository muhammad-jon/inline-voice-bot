# Voice Inline Bot

A production-ready Telegram inline voice bot built with Node.js, Express, Telegraf, Prisma, SQLite, dotenv, CommonJS, long polling, and nodemon.

The bot lets users submit Telegram voice messages in private chat. Users can also submit videos or video notes; the bot extracts the audio and stores the result as a Telegram voice message. Approved voices are posted into a private Telegram storage channel, indexed in SQLite, and returned later through Telegram inline mode as cached voice results that can be previewed before sending.

## Architecture

- Private Telegram channel: permanent voice storage and admin backup.
- SQLite: metadata, search index, moderation status, and usage statistics.
- Telegram `file_id`: cached voice reference used for inline results.

The bot never stores final audio files locally. Normal voice messages are forwarded by Telegram `file_id`. Videos and video notes are downloaded only into a temporary OS folder, converted to `.ogg` Opus with `ffmpeg-static`, sent as Telegram voice messages, and then deleted. SQLite stores only metadata such as file IDs, source file IDs, uploader details, titles, search text, status, counters, and timestamps.

Telegram channels cannot replace SQLite search because the Bot API does not provide a normal full-history channel search API. Inline queries must use the SQLite index.

## Requirements

- Node.js 20 or newer is recommended.
- A Telegram bot token from BotFather.
- A private Telegram channel where the bot is an administrator with permission to post messages.
- A persistent filesystem location for the SQLite database in production.

## Installation

```bash
npm install
```

Copy the example environment file:

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Set:

```env
BOT_TOKEN=your_telegram_bot_token
STORAGE_CHANNEL_ID=-1001234567890
PORT=3000
DATABASE_URL="file:./dev.db"
```

`BOT_TOKEN` and `STORAGE_CHANNEL_ID` are required. Startup fails clearly if either is missing.

## Telegram Setup

Create the bot:

1. Open BotFather.
2. Run `/newbot`.
3. Copy the token into `BOT_TOKEN`.

Enable inline mode:

1. In BotFather, run `/setinline`.
2. Select your bot.
3. Set a placeholder such as `Voice qidirish...`.

Enable inline feedback if you want `chosen_inline_result` usage counts:

1. In BotFather, run `/setinlinefeedback`.
2. Select your bot.
3. Enable feedback.

Create the private storage channel:

1. Create a new private Telegram channel.
2. Add the bot as administrator.
3. Allow it to post and delete messages.

Find the private channel ID:

- Forward a message from the private channel to a bot such as `@userinfobot`, or use a small Bot API `getUpdates` test after adding the bot.
- Private supergroup/channel IDs usually start with `-100`.
- Put that value into `STORAGE_CHANNEL_ID`.

## Database

Create the migration and generate Prisma Client:

```bash
npm run prisma:migrate
npm run prisma:generate
```

Open Prisma Studio when needed:

```bash
npm run prisma:studio
```

## Running

Development:

```bash
npm run dev
```

Production:

```bash
npm start
```

Express endpoints:

- `GET /`
- `GET /health`

## Testing The Bot

Submit a voice:

1. Open the bot in a private chat.
2. Send a Telegram voice message, video, or video note.
3. Send a title or keywords, or press `Matnsiz saqlash`.
4. Confirm the voice appears in the private storage channel.
5. Confirm a row appears in SQLite.

Test inline search:

1. Open any Telegram chat.
2. Type `@your_bot_username hello`.
3. Telegram should show matching cached voice results.
4. Tap a result to preview/listen.
5. Select it to send a clean voice message without a caption.

## Notes

- Duplicate voices and source videos are blocked by Telegram `file_unique_id`.
- Inline results use `InlineQueryResultCachedVoice`.
- Only private chat voice submissions are accepted.
- Search text is normalized to lowercase for SQLite-compatible matching.
- Commands such as `/start`, `/help`, and `/cancel` are never saved as search text.
- The bot does not print `BOT_TOKEN` in logs.

## Docker And Backups

If you run this in Docker, mount a volume for the SQLite file and migrations, for example:

```text
/app/prisma/dev.db
```

Back up both:

- the SQLite database;
- the private Telegram storage channel.

The channel stores the voice posts, while SQLite stores the searchable index and usage data. Losing either one makes recovery incomplete.

## Troubleshooting

- Missing `BOT_TOKEN` or `STORAGE_CHANNEL_ID`: fill `.env`.
- Bot cannot post to channel: make it a channel admin with post permissions.
- Inline results do not appear: enable inline mode with BotFather `/setinline`.
- Usage count does not change: enable inline feedback with `/setinlinefeedback`.
- Channel ID errors: confirm the ID starts with `-100` for private channels.
- Prisma connection errors: check `DATABASE_URL` and run migrations.
- No voice preview: confirm inline results are returned as cached voice results with valid Telegram `file_id`.
