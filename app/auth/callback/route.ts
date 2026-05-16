import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

function isRecentlyCreated(createdAt: string | null | undefined): boolean {
    if (!createdAt) return false;

    const createdAtMs = Date.parse(createdAt);
    if (!Number.isFinite(createdAtMs)) return false;

    const ageMs = Date.now() - createdAtMs;
    return ageMs >= 0 && ageMs <= 15 * 60 * 1000;
}

function resolveSafeNextPath(nextParam: string | null, origin: string): string {
    if (!nextParam) return '/dashboard';

    if (nextParam.startsWith('/') && !nextParam.startsWith('//')) {
        return nextParam;
    }

    try {
        const nextUrl = new URL(nextParam);
        if (nextUrl.origin === origin) {
            return `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`;
        }
    } catch {
        // Ignore invalid URL values and fall back to dashboard.
    }

    return '/dashboard';
}

function buildLoginErrorRedirect(origin: string, errorText: string): string {
    const loginUrl = new URL('/login', origin);
    loginUrl.searchParams.set('error', errorText);
    return loginUrl.toString();
}

function clearSupabaseCookies(response: NextResponse, request: Request) {
    const cookieHeader = request.headers.get('cookie');
    if (!cookieHeader) return;

    const cookieNames = cookieHeader
        .split(';')
        .map((part) => part.trim().split('=')[0])
        .filter((name) => name.startsWith('sb-') || name.includes('-auth-token'));

    cookieNames.forEach((name) => {
        response.cookies.set(name, '', {
            path: '/',
            maxAge: 0,
        });
    });
}

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    const next = resolveSafeNextPath(searchParams.get('next'), origin);
    const shouldShowWelcome = searchParams.get('welcome') === '1';

    if (code) {
        const cookieStore = cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll();
                    },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value, options }) => {
                            cookieStore.set(name, value, options);
                        });
                    },
                },
            }
        );
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) {
            const { data: userResult } = await supabase.auth.getUser();
            const isNewSignup = isRecentlyCreated(userResult.user?.created_at);

            if (shouldShowWelcome && isNewSignup) {
                const welcomeUrl = new URL('/welcome', origin);
                welcomeUrl.searchParams.set('next', next);

                const response = NextResponse.redirect(welcomeUrl.toString());
                response.cookies.set('pathica_welcome_pending', '1', {
                    maxAge: 60 * 10,
                    path: '/',
                    sameSite: 'lax',
                    httpOnly: true,
                });
                return response;
            }

            const redirectUrl = new URL(next, origin);
            return NextResponse.redirect(redirectUrl.toString());
        }
        const response = NextResponse.redirect(
            buildLoginErrorRedirect(origin, 'Session expired. Please sign in again.'),
        );
        clearSupabaseCookies(response, request);
        return response;
    }

    const fallbackError =
        searchParams.get('error_description') ||
        searchParams.get('error') ||
        'Could not authenticate user';

    return NextResponse.redirect(buildLoginErrorRedirect(origin, fallbackError));
}
