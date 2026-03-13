import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken } from '@/lib/auth';

const SUPPORTED_MODELS = [
  { id: 'gemini-2.5-flash', provider: 'gemini', label: 'Gemini 2.5 Flash' },
  { id: 'gemini-2.5-pro', provider: 'gemini', label: 'Gemini 2.5 Pro' },
  { id: 'gemini-2.0-flash-lite', provider: 'gemini', label: 'Gemini 2.0 Flash Lite' },
  { id: 'gpt-4o-mini', provider: 'chatgpt', label: 'GPT-4o Mini' },
  { id: 'gpt-4o', provider: 'chatgpt', label: 'GPT-4o' },
  { id: 'gpt-4.1-mini', provider: 'chatgpt', label: 'GPT-4.1 Mini' },
];

export async function GET(request: NextRequest) {
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

    return NextResponse.json({
      models: SUPPORTED_MODELS.map(model => model.id),
      count: SUPPORTED_MODELS.length,
      fullData: SUPPORTED_MODELS,
    });
  } catch (error: any) {
    console.error('List models error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to list models' },
      { status: 500 }
    );
  }
}
