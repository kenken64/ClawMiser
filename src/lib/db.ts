import Database from "better-sqlite3"
import path from "path"
import fs from "fs"

const DATA_DIR = path.join(process.cwd(), "data")
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })

const db = new Database(path.join(DATA_DIR, "clawmiser.db"))

db.pragma("journal_mode = WAL")
db.pragma("foreign_keys = ON")

db.exec(`
  CREATE TABLE IF NOT EXISTS conversions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_email TEXT NOT NULL,
    filename TEXT NOT NULL,
    file_type TEXT NOT NULL,
    raw_markdown TEXT,
    compressed_markdown TEXT,
    raw_tokens INTEGER DEFAULT 0,
    compressed_tokens INTEGER DEFAULT 0,
    github_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS user_settings (
    user_email TEXT PRIMARY KEY,
    github_repo TEXT,
    github_branch TEXT DEFAULT 'main',
    github_folder TEXT DEFAULT 'converted/'
  );
`)

export default db
