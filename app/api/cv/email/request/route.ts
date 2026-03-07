import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { sendCvVerificationEmail } from '@/lib/email';

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = String(body?.email || '').trim().toLowerCase();
    const cvState = body?.cvState;
    const fingerprint = String(body?.fingerprint || '').trim();

    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: 'A valid email address is required.' }, { status: 400 });
    }

    if (!cvState || !Array.isArray(cvState.sections)) {
      return NextResponse.json({ error: 'Invalid CV state.' }, { status: 400 });
    }

    if (!fingerprint) {
      return NextResponse.json({ error: 'Fingerprint is required.' }, { status: 400 });
    }

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null;

    const { data: session, error: sessionError } = await supabaseAdmin
      .from('anonymous_sessions')
      .select('used_count')
      .eq('fingerprint', fingerprint)
      .maybeSingle();

    if (sessionError) {
      console.error('anonymous_sessions read error:', sessionError);
      return NextResponse.json({ error: 'Could not validate download limit.' }, { status: 500 });
    }

    if (session && session.used_count >= 1) {
      return NextResponse.json({ error: 'Free download limit reached.' }, { status: 403 });
    }

    if (!session) {
      const { error: insertSessionError } = await supabaseAdmin
        .from('anonymous_sessions')
        .insert({ fingerprint, ip, used_count: 0 });

      if (insertSessionError && insertSessionError.code !== '23505') {
        console.error('anonymous_sessions insert error:', insertSessionError);
      }
    }

    const token = `${crypto.randomUUID()}${crypto.randomUUID().replace(/-/g, '')}`;
    const expiresAt = new Date(Date.now() + TOKEN_TTL_MS).toISOString();

    const { data: requestRow, error: insertError } = await supabaseAdmin
      .from('cv_email_requests')
      .insert({
        email,
        token,
        status: 'pending',
        cv_state: cvState,
        fingerprint,
        expires_at: expiresAt,
      })
      .select('id')
      .single();

    if (insertError || !requestRow) {
      console.error('cv_email_requests insert error:', insertError);
      return NextResponse.json({ error: 'Could not create email request.' }, { status: 500 });
    }

    const origin = new URL(req.url).origin;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || origin;
    const verificationUrl = `${appUrl}/api/cv/email/verify?token=${encodeURIComponent(token)}`;

    try {
      await sendCvVerificationEmail(email, verificationUrl);
    } catch (emailError) {
      console.error('Verification email error:', emailError);
      await supabaseAdmin
        .from('cv_email_requests')
        .update({ status: 'failed', error_message: 'verification_email_failed' })
        .eq('id', requestRow.id);

      return NextResponse.json({ error: 'Failed to send verification email.' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('cv/email/request error:', error);
    return NextResponse.json({ error: 'Failed to process email request.' }, { status: 500 });
  }
}

