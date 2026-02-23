import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const response = NextResponse.json({
    message: 'Logged out successfully',
  });

  // Clear the token cookie
  response.cookies.set('token', '', {
    httpOnly: false, // Match login/signup settings
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0, // Expire immediately
    path: '/',
  });

  return response;
}
