import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import pool from '@/lib/db';
import { getUserFromToken } from '@/lib/auth';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
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

    const { message, sessionId, model } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Validate and set model (default to gemini-2.5-flash)
    const allowedModels = ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-2.0-flash-lite'];
    const selectedModel = model && allowedModels.includes(model) ? model : 'gemini-2.5-flash';

    let currentSessionId = sessionId;

    // Create new session if not provided
    if (!currentSessionId) {
      const sessionResult = await pool.query(
        'INSERT INTO chat_sessions (user_id, title) VALUES ($1, $2) RETURNING id',
        [user.userId, 'New Chat']
      );
      currentSessionId = sessionResult.rows[0].id;
    }

    // Get chat history for context BEFORE saving the new message
    const historyResult = await pool.query(
      'SELECT role, content FROM messages WHERE session_id = $1 ORDER BY created_at ASC',
      [currentSessionId]
    );

    // Build conversation history for Gemini
    const chatHistory = historyResult.rows
      .filter(row => row.role !== 'system')
      .map(row => ({
        role: row.role === 'user' ? 'user' : 'model',
        parts: [{ text: row.content }],
      }));

    // Save user message AFTER fetching history
    await pool.query(
      'INSERT INTO messages (session_id, role, content) VALUES ($1, $2, $3)',
      [currentSessionId, 'user', message]
    );

    // Call Gemini API with selected model
    const geminiModel = genAI.getGenerativeModel({ model: selectedModel });
    
    const chat = geminiModel.startChat({
      history: chatHistory,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      },
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    const assistantMessage = response.text();

    // Save assistant message
    await pool.query(
      'INSERT INTO messages (session_id, role, content) VALUES ($1, $2, $3)',
      [currentSessionId, 'assistant', assistantMessage]
    );

    // Update session timestamp
    await pool.query(
      'UPDATE chat_sessions SET updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [currentSessionId]
    );

    return NextResponse.json({
      message: assistantMessage,
      sessionId: currentSessionId,
    });
  } catch (error: any) {
    console.error('Chat error:', error);
    const errorMessage = error?.message || 'Failed to process chat message';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
