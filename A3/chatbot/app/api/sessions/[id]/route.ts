import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getUserFromToken } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // Await params for Next.js 15+ compatibility
    const resolvedParams = await Promise.resolve(params);
    const sessionId = resolvedParams.id;

    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await getUserFromToken(token);
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Verify session belongs to user
    const sessionResult = await pool.query(
      'SELECT id FROM chat_sessions WHERE id = $1 AND user_id = $2',
      [sessionId, user.userId]
    );

    if (sessionResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Get messages for session
    const messagesResult = await pool.query(
      'SELECT id, role, content, created_at FROM messages WHERE session_id = $1 ORDER BY created_at ASC',
      [sessionId]
    );

    return NextResponse.json({ messages: messagesResult.rows });
  } catch (error: any) {
    console.error('Get messages error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // Await params for Next.js 15+ compatibility
    const resolvedParams = await Promise.resolve(params);
    const sessionId = resolvedParams.id;

    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await getUserFromToken(token);
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Delete session (messages will cascade delete)
    const result = await pool.query(
      'DELETE FROM chat_sessions WHERE id = $1 AND user_id = $2 RETURNING id',
      [sessionId, user.userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Session deleted successfully' });
  } catch (error: any) {
    console.error('Delete session error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to delete session' },
      { status: 500 }
    );
  }
}
