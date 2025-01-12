import { NextResponse } from 'next/server';
import { db } from '@/db/db';
import { Question, DBQuestion } from '@/lib/types'

const initialQuestions: Question[] = [
  {
    id: 1,
    title: "2024 Tech Trends",
    description: "What will be the most impactful technology in 2024?",
    options: ["AI", "Quantum Computing", "AR/VR", "Blockchain"],
    votes: {
      "AI": 0,
      "Quantum Computing": 0,
      "AR/VR": 0,
      "Blockchain": 0
    },
    order: 0
  },
  {
    id: 2,
    title: "Future of Work",
    description: "How will most people work in 2025?",
    options: ["Remote", "Hybrid", "Office", "AI-Assisted"],
    votes: {
      "Remote": 0,
      "Hybrid": 0,
      "Office": 0,
      "AI-Assisted": 0
    },
    order: 1
  }
];

export async function GET() {
  try {
    const stmt = db.prepare('SELECT * FROM questions ORDER BY `order`');
    const questions = stmt.all() as DBQuestion[];

    if (questions.length === 0) {
      return NextResponse.json(initialQuestions);
    }

    const parsedQuestions = questions.map((q: DBQuestion) => ({
      ...q,
      options: JSON.parse(q.options),
      votes: JSON.parse(q.votes)
    }));

    return NextResponse.json(parsedQuestions);
  } catch (error) {
    console.error('Failed to fetch questions:', error);
    return NextResponse.json(initialQuestions);
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    const stmt = db.prepare(`
      UPDATE questions 
      SET votes = ?
      WHERE id = ?
    `);

    stmt.run(JSON.stringify(data.votes), data.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update question:', error);
    return NextResponse.json({ error: 'Failed to update question' }, { status: 500 });
  }
}