import { sql } from '@vercel/postgres';

export async function initializeDb() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS questions (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        options TEXT NOT NULL,
        votes TEXT NOT NULL,
        "order" INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Check if table is empty
    const { rows } = await sql`SELECT COUNT(*) as count FROM questions`;
    
    if (rows[0].count === '0') {
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

      for (const q of initialQuestions) {
        await sql`
          INSERT INTO questions (title, description, options, votes, "order")
          VALUES (${q.title}, ${q.description}, ${q.options}, ${q.votes}, ${q.order})
        `;
      }
    }
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}