import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // Public paths that don't require authentication
  const publicPaths = ['/', '/login', '/signup', '/api/auth/login', '/api/auth/signup'];
  const isPublicPath = publicPaths.includes(pathname);

  // Redirect to login if accessing protected route without token
  if (!token && pathname.startsWith('/chat')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Redirect to chat if accessing auth pages with valid token
  if ((pathname === '/login' || pathname === '/signup') && token) {
    return NextResponse.redirect(new URL('/chat', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/chat/:path*', '/login', '/signup'],
};
