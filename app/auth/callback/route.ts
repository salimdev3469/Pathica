import { NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

function isRecentlyCreated(createdAt: string | null | undefined): boolean {
    if (!createdAt) return false;

    const createdAtMs = Date.parse(createdAt);
    if (!Number.isFinite(createdAtMs)) return false;

    const ageMs = Date.now() - createdAtMs;
    return ageMs >= 0 && ageMs <= 15 * 60 * 1000;
}

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    // if "next" is in param, use it as the redirect URL
    const next = searchParams.get('next') ?? '/dashboard';
    const shouldShowWelcome = searchParams.get('welcome') === '1';

    if (code) {
        const cookieStore = cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return cookieStore.get(name)?.value;
                    },
                    set(name: string, value: string, options: CookieOptions) {
                        cookieStore.set({ name, value, ...options });
                    },
                    remove(name: string, options: CookieOptions) {
                        cookieStore.delete({ name, ...options });
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
        console.error('Auth error:', error);
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/login?error=Could not authenticate user`);
}
