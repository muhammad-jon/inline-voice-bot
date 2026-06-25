const fs = require('fs');
const path = require('path');

require('dotenv').config({ quiet: true });

function getSqliteFilePath(databaseUrl) {
  if (!databaseUrl || !databaseUrl.startsWith('file:')) {
    return null;
  }

  const rawPath = databaseUrl.slice('file:'.length);

  if (!rawPath) {
    return null;
  }

  if (path.isAbsolute(rawPath)) {
    return rawPath;
  }

  return path.resolve(process.cwd(), rawPath);
}

function ensureSqliteDirectory() {
  const databaseUrl = process.env.DATABASE_URL || 'file:./dev.db';
  const sqliteFilePath = getSqliteFilePath(databaseUrl);

  if (!sqliteFilePath) {
    return;
  }

  const directory = path.dirname(sqliteFilePath);
  fs.mkdirSync(directory, { recursive: true });
  console.log(`SQLite directory ready: ${directory}`);
}

ensureSqliteDirectory();
