import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken } from '@/lib/auth';

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

    // List available models using the REST API
    const apiKey = process.env.GEMINI_API_KEY;
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch models from Gemini API');
    }

    const data = await response.json();
    const modelNames = data.models
      ? data.models.map((model: any) => model.name)
      : [];

    console.log('Available Models:', modelNames);

    return NextResponse.json({
      models: modelNames,
      count: modelNames.length,
      fullData: data.models, // Include full model details
    });
  } catch (error: any) {
    console.error('List models error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to list models' },
      { status: 500 }
    );
  }
}
