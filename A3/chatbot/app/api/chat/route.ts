import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import pool from '@/lib/db';
import { getUserFromToken } from '@/lib/auth';
import { logDevApiRequest } from '@/lib/dev-request-log';

export const runtime = 'nodejs';

const GEMINI_MODELS = ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-2.0-flash-lite'] as const;
const OPENAI_MODELS = ['gpt-4o-mini', 'gpt-4o', 'gpt-4.1-mini'] as const;

type Provider = 'gemini' | 'openai';

function resolveProviderAndModel(requestedModel?: string): { provider: Provider; model: string } {
  if (requestedModel && OPENAI_MODELS.includes(requestedModel as (typeof OPENAI_MODELS)[number])) {
    return { provider: 'openai', model: requestedModel };
  }

  if (requestedModel && GEMINI_MODELS.includes(requestedModel as (typeof GEMINI_MODELS)[number])) {
    return { provider: 'gemini', model: requestedModel };
  }

  return { provider: 'gemini', model: 'gemini-2.5-flash' };
}

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

    const { provider, model: selectedModel } = resolveProviderAndModel(model);

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

    // Normalize history once and transform per provider.
    const messageHistory = historyResult.rows
      .filter(row => row.role !== 'system')
      .map(row => ({ role: row.role, content: row.content }));

    // Save user message AFTER fetching history
    await pool.query(
      'INSERT INTO messages (session_id, role, content) VALUES ($1, $2, $3)',
      [currentSessionId, 'user', message]
    );

    let assistantMessage = '';

    if (provider === 'gemini') {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY is not configured');
      }

      const geminiHistory = messageHistory.map(row => ({
        role: row.role === 'user' ? 'user' : 'model',
        parts: [{ text: row.content }],
      }));

      const geminiPayload = {
        history: geminiHistory,
        message,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        },
      };

      await logDevApiRequest({
        provider,
        model: selectedModel,
        sessionId: currentSessionId,
        userId: user.userId,
        payload: geminiPayload,
      });

      const geminiModel = genAI.getGenerativeModel({ model: selectedModel });
      const chat = geminiModel.startChat({
        history: geminiPayload.history,
        generationConfig: geminiPayload.generationConfig,
      });

      const result = await chat.sendMessage(geminiPayload.message);
      const response = await result.response;
      assistantMessage = response.text();
    } else {
      const openAiApiKey = process.env.OPENAI_API_KEY;
      if (!openAiApiKey) {
        throw new Error('OPENAI_API_KEY is not configured');
      }

      const openAiPayload = {
        model: selectedModel,
        messages: [
          ...messageHistory.map(row => ({
            role: row.role === 'assistant' ? 'assistant' : 'user',
            content: row.content,
          })),
          { role: 'user' as const, content: message },
        ],
        temperature: 0.7,
        max_tokens: 2048,
      };

      await logDevApiRequest({
        provider,
        model: selectedModel,
        sessionId: currentSessionId,
        userId: user.userId,
        payload: openAiPayload,
      });

      const openAiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openAiApiKey}`,
        },
        body: JSON.stringify(openAiPayload),
      });

      const openAiData = await openAiResponse.json();
      if (!openAiResponse.ok) {
        throw new Error(openAiData?.error?.message || 'Failed to get OpenAI response');
      }

      assistantMessage = openAiData?.choices?.[0]?.message?.content || '';
      if (!assistantMessage) {
        throw new Error('OpenAI returned an empty response');
      }
    }

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
