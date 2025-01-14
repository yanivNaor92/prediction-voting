import { NextResponse } from 'next/server';
import { pusher } from '@/lib/pusher';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    await pusher.trigger('voting-channel', 'reset-session', data);
    return NextResponse.json({ success: true });
    } catch (err: unknown) {
    console.error('Error moving to next question:', err);
    return NextResponse.json({ error: 'Failed to reset session' }, { status: 500 });
  }
}