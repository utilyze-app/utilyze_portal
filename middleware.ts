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

    console.log('Middleware:', {
        pathname: request.nextUrl.pathname,
        isAuthPage,
        isProtectedRoute,
        hasSession,
        searchParams: request.nextUrl.searchParams.toString()
    });

    // Redirect to login if accessing protected route without session
    if (isProtectedRoute && !hasSession) {
        console.log('Redirecting to login - no session');
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // Note: We removed the redirect from auth pages to dashboard
    // This allows logout to work properly. Users will be redirected
    // to dashboard by the login page itself if they're already logged in

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
