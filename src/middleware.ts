import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  // Allow public pages for everyone
  if (pathname.startsWith('/sign-in') || pathname.startsWith('/sign-up')) {
    if (token) {
      // Logged in users should not see login/signup
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    return NextResponse.next(); // allow access
  }

  // Protect all other routes
  if (!token) {
    return NextResponse.redirect(new URL('/sign-in', req.url));
  }

  // Logged-in users can access protected routes
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/sign-in',
    '/sign-up',
    '/',
    '/dashboard/:path*',
  ],
};
