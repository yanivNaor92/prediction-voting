import { NextResponse } from 'next/server';
import { pusher } from '@/lib/pusher';

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const data = await req.json();
    await pusher.trigger('voting-channel', 'next-question', data);
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error('Error moving to next question:', err);
    return NextResponse.json({ error: 'Failed to move to next question' }, { status: 500 });
  }
}