import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const LOCALHOST_HOSTNAMES = new Set(['localhost', '127.0.0.1', '0.0.0.0', '::1']);

function parseUrlOrigin(value: string | null | undefined): string | null {
    if (!value) return null;

    try {
        return new URL(value).origin;
    } catch {
        return null;
    }
}

function isLocalhostOrigin(value: string | null | undefined): boolean {
    if (!value) return false;

    try {
        return LOCALHOST_HOSTNAMES.has(new URL(value).hostname);
    } catch {
        return false;
    }
}

function getFirstForwardedValue(value: string | null): string | null {
    if (!value) return null;
    const [first = ''] = value.split(',');
    const normalized = first.trim();
    return normalized || null;
}

function resolveRequestOrigin(request: Request): string {
    const requestUrl = new URL(request.url);
    const requestOrigin = requestUrl.origin;
    const isProduction = process.env.NODE_ENV === 'production';
    const configuredOrigin = parseUrlOrigin(
        process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || process.env.PUBLIC_APP_URL || null
    );

    const forwardedHost = getFirstForwardedValue(request.headers.get('x-forwarded-host'));
    const forwardedProtoRaw = getFirstForwardedValue(request.headers.get('x-forwarded-proto'));
    const forwardedProto = forwardedProtoRaw ? forwardedProtoRaw.replace(/:$/, '') : requestUrl.protocol.replace(/:$/, '');
    const forwardedOrigin = forwardedHost ? parseUrlOrigin(`${forwardedProto}://${forwardedHost}`) : null;

    if (forwardedOrigin && !isLocalhostOrigin(forwardedOrigin)) {
        return forwardedOrigin;
    }

    if (isProduction && isLocalhostOrigin(requestOrigin) && configuredOrigin && !isLocalhostOrigin(configuredOrigin)) {
        return configuredOrigin;
    }

    return forwardedOrigin || requestOrigin;
}

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
    const { searchParams } = new URL(request.url);
    const origin = resolveRequestOrigin(request);
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
