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

    // Create documents table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS documents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        content TEXT,
        restricted BOOLEAN,
        isPinned BOOLEAN DEFAULT 0,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Check and add category column to documents
    const documentsInfo = await db.all("PRAGMA table_info(documents)");
    const categoryExists = documentsInfo.some((column: any) => column.name === 'category');
    if (!categoryExists) {
      await db.exec('ALTER TABLE documents ADD COLUMN category TEXT DEFAULT "General";');
    }

    // Create categories table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        parentId INTEGER,
        orderIndex INTEGER DEFAULT 0,
        FOREIGN KEY (parentId) REFERENCES categories(id)
      );
    `);

    // Create tags table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS tags (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        color TEXT NOT NULL
      );
    `);

    // Create document_tags table for many-to-many relationship
    await db.exec(`
      CREATE TABLE IF NOT EXISTS document_tags (
        documentId INTEGER,
        tagId INTEGER,
        PRIMARY KEY (documentId, tagId),
        FOREIGN KEY (documentId) REFERENCES documents(id) ON DELETE CASCADE,
        FOREIGN KEY (tagId) REFERENCES tags(id) ON DELETE CASCADE
      );
    `);
  }
  return db;
}

// Rest of your existing functions remain the same...

export async function getCategories(): Promise<Category[]> {
  const db = await openDb();
  return db.all(`
    SELECT 
      c.id, 
      c.name, 
      c.parentId,
      c.orderIndex,
      COUNT(d.id) as documentCount
    FROM categories c
    LEFT JOIN documents d ON d.category = c.name
    GROUP BY c.id
    ORDER BY c.orderIndex
  `);
}

export async function createCategory(name: string, parentId?: number): Promise<Category> {
  const db = await openDb();
  const maxOrder = await db.get('SELECT MAX(orderIndex) as maxOrder FROM categories');
  const result = await db.run(
    'INSERT INTO categories (name, parentId, orderIndex) VALUES (?, ?, ?)',
    name,
    parentId || null,
    (maxOrder?.maxOrder || 0) + 1
  );
  return {
    id: result.lastID!,
    name,
    parentId: parentId || null,
    order: (maxOrder?.maxOrder || 0) + 1
  };
}

export async function updateCategory(id: number, name: string): Promise<void> {
  const db = await openDb();
  await db.run('UPDATE categories SET name = ? WHERE id = ?', name, id);
}

export async function deleteCategory(id: number): Promise<void> {
  const db = await openDb();
  await db.run('DELETE FROM categories WHERE id = ?', id);
}

export async function reorderCategory(id: number, newOrder: number): Promise<void> {
  const db = await openDb();
  await db.run('UPDATE categories SET orderIndex = ? WHERE id = ?', newOrder, id);
}

export async function getTags(): Promise<Tag[]> {
  const db = await openDb();
  return db.all('SELECT * FROM tags');
}

export async function createTag(name: string, color: string): Promise<Tag> {
  const db = await openDb();
  const result = await db.run(
    'INSERT INTO tags (name, color) VALUES (?, ?)',
    name,
    color
  );
  return { id: result.lastID!, name, color };
}

export async function deleteTag(id: number): Promise<void> {
  const db = await openDb();
  await db.run('DELETE FROM tags WHERE id = ?', id);
}

export async function updateDocumentTags(documentId: number, tagIds: number[]): Promise<void> {
  const db = await openDb();
  await db.run('BEGIN TRANSACTION');
  try {
    await db.run('DELETE FROM document_tags WHERE documentId = ?', documentId);
    for (const tagId of tagIds) {
      await db.run(
        'INSERT INTO document_tags (documentId, tagId) VALUES (?, ?)',
        documentId,
        tagId
      );
    }
    await db.run('COMMIT');
  } catch (error) {
    await db.run('ROLLBACK');
    throw error;
  }
}

// Update existing document functions to include new fields
export async function getDocuments(includeRestricted: boolean) {
  const db = await openDb();
  const documents = await db.all(`
    SELECT 
      d.*,
      GROUP_CONCAT(t.id) as tagIds,
      GROUP_CONCAT(t.name) as tagNames,
      GROUP_CONCAT(t.color) as tagColors
    FROM documents d
    LEFT JOIN document_tags dt ON d.id = dt.documentId
    LEFT JOIN tags t ON dt.tagId = t.id
    ${includeRestricted ? '' : 'WHERE d.restricted = 0'}
    GROUP BY d.id
    ORDER BY d.isPinned DESC, d.updatedAt DESC
  `);

  return documents.map(doc => ({
    ...doc,
    tags: doc.tagIds ? doc.tagIds.split(',').map((id: string, index: number) => ({
      id: parseInt(id),
      name: doc.tagNames.split(',')[index],
      color: doc.tagColors.split(',')[index]
    })) : []
  }));
}

export async function createDocument(
  title: string,
  content: string,
  restricted: boolean,
  categoryId: number,
  tagIds: number[] = []
) {
  const db = await openDb();
  await db.run('BEGIN TRANSACTION');
  try {
    const result = await db.run(
      `INSERT INTO documents (
        title, content, restricted, categoryId, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      title,
      content,
      restricted ? 1 : 0,
      categoryId
    );
    
    for (const tagId of tagIds) {
      await db.run(
        'INSERT INTO document_tags (documentId, tagId) VALUES (?, ?)',
        result.lastID,
        tagId
      );
    }
    
    await db.run('COMMIT');
    return result.lastID;
  } catch (error) {
    await db.run('ROLLBACK');
    throw error;
  }
}

export async function toggleDocumentPin(id: number): Promise<void> {
  const db = await openDb();
  await db.run('UPDATE documents SET isPinned = NOT isPinned WHERE id = ?', id);
}