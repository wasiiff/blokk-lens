import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import ChatHistory from '@/models/ChatHistory';
import dbConnect from '@/lib/db';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');

    if (sessionId) {
      // Get specific chat session
      const chat = await ChatHistory.findOne({
        userId: session.user.id,
        sessionId,
      });
      return NextResponse.json(chat);
    }

    // Get all chat sessions for user
    const chats = await ChatHistory.find({ userId: session.user.id })
      .sort({ updatedAt: -1 })
      .limit(50)
      .select('sessionId title messages createdAt updatedAt');

    return NextResponse.json(chats);
  } catch (error) {
    console.error('Error fetching chat history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chat history' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID required' },
        { status: 400 }
      );
    }

    await dbConnect();

    await ChatHistory.deleteOne({
      userId: session.user.id,
      sessionId,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting chat history:', error);
    return NextResponse.json(
      { error: 'Failed to delete chat history' },
      { status: 500 }
    );
  }
}
