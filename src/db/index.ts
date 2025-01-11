import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { questions } from './schema';

// Use relative path for database file
const sqlite = new Database('./voting.db');
export const db = drizzle(sqlite);

export const initializeDb = async () => {
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

    // Check if table is empty and insert initial data if needed
    const count = sqlite.prepare('SELECT COUNT(*) as count FROM questions').get();
    if (count.count === 0) {
      console.log('Inserting initial questions...');
      const initialQuestions = [
        {
          title: "2024 Tech Trends",
          description: "What will be the most impactful technology in 2024?",
          options: JSON.stringify(["AI", "Quantum Computing", "AR/VR", "Blockchain"]),
          votes: JSON.stringify({
            "AI": 0,
            "Quantum Computing": 0,
            "AR/VR": 0,
            "Blockchain": 0
          }),
          order: 0
        },
        {
          title: "Future of Work",
          description: "How will most people work in 2025?",
          options: JSON.stringify(["Remote", "Hybrid", "Office", "AI-Assisted"]),
          votes: JSON.stringify({
            "Remote": 0,
            "Hybrid": 0,
            "Office": 0,
            "AI-Assisted": 0
          }),
          order: 1
        }
      ];

      initialQuestions.forEach(q => {
        sqlite.prepare(`
          INSERT INTO questions (title, description, options, votes, \`order\`)
          VALUES (@title, @description, @options, @votes, @order)
        `).run(q);
      });
    }
  } catch (error) {
    console.error('Database initialization error:', error);
  }
};