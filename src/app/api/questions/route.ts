import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { Question } from '@prisma/client';

export async function PUT(request: Request) {
  try {
    const data = await request.json(); 
    
    const result = await prisma.question.update({
      where: { id: data.id },
      data: {
        votes: JSON.stringify(data.votes) // Convert votes object to string
      }
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Failed to update question:', error);
    return NextResponse.json({ error: 'Failed to update question' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const questions = await prisma.question.findMany({
      orderBy: { order: 'asc' }
    });

    // "q" is recognized as a "Question"
    return NextResponse.json(
      questions.map((q: Question) => ({
        ...q,
        options: JSON.parse(q.options),
        votes: JSON.parse(q.votes)
      }))
    );
  } catch (error) {
    console.error('Failed to fetch questions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch questions' },
      { status: 500 }
    );
  }
}