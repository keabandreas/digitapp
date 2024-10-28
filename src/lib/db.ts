import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
import path from 'path'

let db: any = null;

async function openDb() {
  if (!db) {
    const dbPath = process.env.SQLITE_DB_PATH || path.resolve('./wiki.sqlite');
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    await db.exec(`
      CREATE TABLE IF NOT EXISTS documents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        content TEXT,
        restricted BOOLEAN
      );
    `);

    // Check if the category column exists, if not, add it
    const tableInfo = await db.all("PRAGMA table_info(documents)");
    const categoryExists = tableInfo.some((column: any) => column.name === 'category');
    if (!categoryExists) {
      await db.exec('ALTER TABLE documents ADD COLUMN category TEXT DEFAULT "General";');
    }
  }
  return db;
}

export async function getDocuments(includeRestricted: boolean) {
  const db = await openDb();
  if (includeRestricted) {
    return db.all('SELECT * FROM documents');
  } else {
    return db.all('SELECT * FROM documents WHERE restricted = 0');
  }
}

export async function getDocument(id: number, includeRestricted: boolean) {
  const db = await openDb();
  if (includeRestricted) {
    return db.get('SELECT * FROM documents WHERE id = ?', id);
  } else {
    return db.get('SELECT * FROM documents WHERE id = ? AND restricted = 0', id);
  }
}

export async function createDocument(title: string, content: string, restricted: boolean, category: string) {
  const db = await openDb();
  return db.run('INSERT INTO documents (title, content, restricted, category) VALUES (?, ?, ?, ?)', title, content, restricted ? 1 : 0, category);
}

export async function updateDocument(id: number, title: string, content: string, restricted: boolean, category: string) {
  const db = await openDb();
  return db.run('UPDATE documents SET title = ?, content = ?, restricted = ?, category = ? WHERE id = ?', title, content, restricted ? 1 : 0, category, id);
}

export async function toggleDocumentRestriction(id: number) {
  const db = await openDb();
  return db.run('UPDATE documents SET restricted = NOT restricted WHERE id = ?', id);
}

export async function getCategories() {
  const db = await openDb();
  return db.all('SELECT DISTINCT category FROM documents');
}
