import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;
    const hasOAuthCode = request.nextUrl.searchParams.has('code');

    if (pathname === '/' && hasOAuthCode) {
        const callbackUrl = request.nextUrl.clone();
        callbackUrl.pathname = '/auth/callback';
        return NextResponse.redirect(callbackUrl);
    }

    const protectedPaths = ['/dashboard', '/applications', '/billing', '/admin'];
    const isProtectedPath =
        protectedPaths.some((path) => pathname.startsWith(path)) ||
        (pathname.startsWith('/cv/') && pathname !== '/cv/new');

    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    if (!isProtectedPath) {
        return response;
    }

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder',
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    });
                    cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
                },
            },
        }
    );

    let user = null;
    try {
        const {
            data: { user: currentUser },
        } = await supabase.auth.getUser();
        user = currentUser;
    } catch (error) {
        const message = error instanceof Error ? error.message : 'unknown_error';
        console.warn(`Supabase auth read failed in middleware: ${message}`);
        request.cookies
            .getAll()
            .filter(({ name }) => name.startsWith('sb-') || name.includes('-auth-token'))
            .forEach(({ name }) => {
                response.cookies.set(name, '', {
                    path: '/',
                    maxAge: 0,
                });
            });
    }

    if (isProtectedPath && !user) {
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        url.searchParams.set('next', request.nextUrl.pathname);
        return NextResponse.redirect(url);
    }

    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
