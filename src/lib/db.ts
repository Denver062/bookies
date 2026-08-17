import Database from "better-sqlite3";
import { existsSync, mkdirSync } from "fs";
import path from "path";
import { connection } from "next/server";

const globalForDb = globalThis as unknown as { __bookiesDb?: Database.Database };

function migrate(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      passwordHash TEXT NOT NULL,
      avatarColor TEXT NOT NULL DEFAULT '#b25a3a',
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS books (
      id TEXT PRIMARY KEY,
      googleId TEXT UNIQUE,
      title TEXT NOT NULL,
      authors TEXT NOT NULL DEFAULT '',
      translator TEXT,
      publisher TEXT,
      publishedAt TEXT,
      isbn TEXT,
      pageCount INTEGER,
      thumbnail TEXT,
      infoLink TEXT,
      description TEXT,
      averageRating REAL,
      ratingsCount INTEGER,
      isFavorite INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY,
      bookId TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      content TEXT NOT NULL DEFAULT '',
      rating INTEGER,
      isPublic INTEGER NOT NULL DEFAULT 0,
      sharePassword TEXT,
      bgColor TEXT,
      bgDark REAL NOT NULL DEFAULT 1,
      readDate TEXT,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS clips (
      id TEXT PRIMARY KEY,
      noteId TEXT NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
      quote TEXT NOT NULL,
      page TEXT,
      memo TEXT,
      createdAt TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS links (
      id TEXT PRIMARY KEY,
      noteId TEXT NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
      label TEXT,
      url TEXT NOT NULL,
      fileData TEXT,
      fileName TEXT,
      fileType TEXT,
      createdAt TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS folders (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      color TEXT,
      createdAt TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS book_folders (
      bookId TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
      folderId TEXT NOT NULL REFERENCES folders(id) ON DELETE CASCADE,
      PRIMARY KEY (bookId, folderId)
    );

    CREATE INDEX IF NOT EXISTS idx_notes_book ON notes(bookId);
    CREATE INDEX IF NOT EXISTS idx_clips_note ON clips(noteId);
    CREATE INDEX IF NOT EXISTS idx_links_note ON links(noteId);
    CREATE INDEX IF NOT EXISTS idx_book_folders_folder ON book_folders(folderId);
  `);

  const cols = db.prepare("PRAGMA table_info(books)").all() as { name: string }[];
  if (!cols.some((c) => c.name === "averageRating")) {
    db.exec(`ALTER TABLE books ADD COLUMN averageRating REAL`);
    db.exec(`ALTER TABLE books ADD COLUMN ratingsCount INTEGER`);
  }

  const noteCols = db.prepare("PRAGMA table_info(notes)").all() as { name: string }[];
  if (!noteCols.some((c) => c.name === "sharePassword")) {
    db.exec(`ALTER TABLE notes ADD COLUMN sharePassword TEXT`);
  }
  if (!noteCols.some((c) => c.name === "userId")) {
    db.exec(`ALTER TABLE notes ADD COLUMN userId TEXT REFERENCES users(id)`);
  }

  const bookCols = db.prepare("PRAGMA table_info(books)").all() as { name: string }[];
  if (!bookCols.some((c) => c.name === "userId")) {
    db.exec(`ALTER TABLE books ADD COLUMN userId TEXT REFERENCES users(id)`);
  }

  const folderCols = db.prepare("PRAGMA table_info(folders)").all() as { name: string }[];
  if (!folderCols.some((c) => c.name === "userId")) {
    db.exec(`ALTER TABLE folders ADD COLUMN userId TEXT REFERENCES users(id)`);
  }

  const firstUser = db.prepare("SELECT id FROM users LIMIT 1").get() as { id: string } | undefined;
  if (firstUser) {
    db.prepare("UPDATE books SET userId = ? WHERE userId IS NULL").run(firstUser.id);
    db.prepare("UPDATE notes SET userId = ? WHERE userId IS NULL").run(firstUser.id);
    db.prepare("UPDATE folders SET userId = ? WHERE userId IS NULL").run(firstUser.id);
  }
}

function getDb() {
  if (!globalForDb.__bookiesDb) {
    const dbPath =
      process.env.DATABASE_PATH || path.join(process.cwd(), "data", "bookies.db");
    const dir = path.dirname(dbPath);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    const db = new Database(dbPath);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
    migrate(db);
    globalForDb.__bookiesDb = db;
  }
  return globalForDb.__bookiesDb;
}

export async function db<T>(fn: (db: Database.Database) => T): Promise<T> {
  await connection();
  return fn(getDb());
}

export function dbSync<T>(fn: (db: Database.Database) => T): T {
  return fn(getDb());
}

export function newId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}


