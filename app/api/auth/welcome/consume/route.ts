import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const PENDING_COOKIE = 'pathica_welcome_pending';
const SEEN_COOKIE = 'pathica_welcome_seen';

export async function POST() {
  const cookieStore = cookies();
  const hasPending = cookieStore.get(PENDING_COOKIE)?.value === '1';
  const hasSeen = cookieStore.get(SEEN_COOKIE)?.value === '1';
  const allow = hasPending && !hasSeen;

  const response = NextResponse.json({ allow });

  if (hasPending) {
    response.cookies.set(PENDING_COOKIE, '', {
      maxAge: 0,
      path: '/',
      sameSite: 'lax',
      httpOnly: true,
    });
  }

  if (allow) {
    response.cookies.set(SEEN_COOKIE, '1', {
      maxAge: 60 * 60 * 24 * 365,
      path: '/',
      sameSite: 'lax',
      httpOnly: true,
    });
  }

  return response;
}
