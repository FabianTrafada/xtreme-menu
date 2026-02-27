import { neon } from "@neondatabase/serverless";

export function getDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set");
  }
  // Strip surrounding quotes and trailing backslashes that .env parsers sometimes leave
  const url = process.env.DATABASE_URL.replace(/^["']|["']$/g, "").replace(/\\+$/, "");
  return neon(url);
}

export async function initDb() {
  const sql = getDb();

  await sql`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS menu_items (
      id TEXT PRIMARY KEY,
      category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      description TEXT,
      price INTEGER NOT NULL DEFAULT 0,
      image TEXT,
      popular BOOLEAN DEFAULT FALSE,
      ingredients TEXT[],
      image_aspect_ratio REAL DEFAULT 1.777
    )
  `;

  // Ensure column exists for existing tables
  try {
    await sql`ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS image_aspect_ratio REAL DEFAULT 1.777`;
  } catch (e) {
    // Column might already exist or other DB issues, ignore in this simple setup
    console.log("Migration check:", e);
  }
}
