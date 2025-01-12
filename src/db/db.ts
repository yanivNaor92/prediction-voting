import Database from 'better-sqlite3';

const sqlite = new Database('voting.db');

export const initializeDb = (): void => {
  try {
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        options TEXT NOT NULL,
        votes TEXT NOT NULL,
        \`order\` INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
  } catch (error) {
    console.error('Database initialization error:', error);
  }
};

export const db = sqlite;