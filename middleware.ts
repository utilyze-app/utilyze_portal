import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const isAuthPage = request.nextUrl.pathname.startsWith('/login') ||
        request.nextUrl.pathname.startsWith('/register');

    const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard') ||
        request.nextUrl.pathname.startsWith('/billing') ||
        request.nextUrl.pathname.startsWith('/usage');

    // Check for NextAuth session cookie
    const sessionCookie = request.cookies.get('authjs.session-token') ||
        request.cookies.get('__Secure-authjs.session-token');

    const hasSession = !!sessionCookie;

    // Redirect to login if accessing protected route without session
    if (isProtectedRoute && !hasSession) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // Redirect to dashboard if logged in and trying to access auth pages
    if (isAuthPage && hasSession) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
