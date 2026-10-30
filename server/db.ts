import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { DatabaseSync, type SQLInputValue } from 'node:sqlite';

export const SERVER_DIR = join(process.cwd(), 'server');
export const DATA_DIR = join(SERVER_DIR, 'data');
export const UPLOAD_DIR = join(SERVER_DIR, 'uploads');

const DB_PATH = process.env.DB_PATH ?? join(DATA_DIR, 'uwevwi.db');
mkdirSync(dirname(DB_PATH), { recursive: true });
mkdirSync(UPLOAD_DIR, { recursive: true });

export const db = new DatabaseSync(DB_PATH);
db.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');

db.exec(`
CREATE TABLE IF NOT EXISTS admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,
  admin_id INTEGER NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS reset_tokens (
  token_hash TEXT PRIMARY KEY,
  admin_id INTEGER NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS research (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  excerpt TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  image TEXT,
  part TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  publish_at TEXT,
  author TEXT NOT NULL DEFAULT 'Admin',
  views INTEGER NOT NULL DEFAULT 0,
  comments_hidden INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS exhibitions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  series TEXT NOT NULL DEFAULT '',
  edition TEXT NOT NULL DEFAULT '',
  date_label TEXT NOT NULL DEFAULT '',
  location TEXT NOT NULL DEFAULT '',
  intro TEXT NOT NULL DEFAULT '',
  flyer TEXT,
  gallery_heading TEXT NOT NULL DEFAULT '',
  gallery_text TEXT NOT NULL DEFAULT '',
  gallery TEXT NOT NULL DEFAULT '[]',
  artists TEXT NOT NULL DEFAULT '[]',
  note_heading TEXT NOT NULL DEFAULT '',
  note_text TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS site_images (
  key TEXT PRIMARY KEY,
  path TEXT,
  updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  research_id INTEGER NOT NULL REFERENCES research(id) ON DELETE CASCADE,
  parent_id INTEGER REFERENCES comments(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL,
  is_author INTEGER NOT NULL DEFAULT 0,
  likes INTEGER NOT NULL DEFAULT 0,
  is_read INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS enquiries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  organisation TEXT NOT NULL DEFAULT '',
  topic TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS activity (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  detail TEXT NOT NULL,
  created_at TEXT NOT NULL
);
`);

type Row = Record<string, SQLInputValue>;

export function all<T = Row>(sql: string, ...params: SQLInputValue[]): T[] {
  return db.prepare(sql).all(...params) as T[];
}
export function get<T = Row>(sql: string, ...params: SQLInputValue[]): T | undefined {
  return db.prepare(sql).get(...params) as T | undefined;
}
export function run(sql: string, ...params: SQLInputValue[]) {
  return db.prepare(sql).run(...params);
}

// Older databases were created before enquiries could be marked as read.
if (!all<{ name: string }>('PRAGMA table_info(enquiries)').some((c) => c.name === 'is_read')) {
  db.exec('ALTER TABLE enquiries ADD COLUMN is_read INTEGER NOT NULL DEFAULT 0');
}

export const now = () => new Date().toISOString();

export function logActivity(title: string, detail: string) {
  run('INSERT INTO activity (title, detail, created_at) VALUES (?, ?, ?)', title, detail, now());
}

export function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80) || 'untitled'
  );
}

/** A slug that is unique in `table`, ignoring the row with `exceptId`. */
export function uniqueSlug(table: 'research' | 'exhibitions', title: string, exceptId?: number): string {
  const base = slugify(title);
  let slug = base;
  let n = 2;
  while (get(`SELECT id FROM ${table} WHERE slug = ? AND id != ?`, slug, exceptId ?? -1)) {
    slug = `${base}-${n++}`;
  }
  return slug;
}
