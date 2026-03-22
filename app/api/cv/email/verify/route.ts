import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { generateCvPdfBuffer } from '@/lib/cv-pdf';
import { sendCvPdfEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

function getAppUrl(req: Request) {
  const origin = new URL(req.url).origin;
  return process.env.NEXT_PUBLIC_APP_URL || origin;
}

function toSafeErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message.slice(0, 500);
  }
  return 'unknown_error';
}

export async function GET(req: Request) {
  const appUrl = getAppUrl(req);
  const redirectTo = (status: string) => NextResponse.redirect(`${appUrl}/email/sent?status=${status}`);

  try {
    const url = new URL(req.url);
    const token = url.searchParams.get('token');

    if (!token) {
      return redirectTo('invalid');
    }

    const { data: emailRequest, error } = await supabaseAdmin
      .from('cv_email_requests')
      .select('*')
      .eq('token', token)
      .maybeSingle();

    if (error || !emailRequest) {
      return redirectTo('invalid');
    }

    const now = Date.now();
    const expiresAt = new Date(emailRequest.expires_at).getTime();

    if (Number.isFinite(expiresAt) && now > expiresAt) {
      await supabaseAdmin
        .from('cv_email_requests')
        .update({ status: 'failed', error_message: 'token_expired' })
        .eq('id', emailRequest.id);
      return redirectTo('expired');
    }

    if (emailRequest.status === 'sent') {
      return redirectTo('sent');
    }

    const cvState = emailRequest.cv_state;
    if (!cvState || !Array.isArray(cvState.sections)) {
      await supabaseAdmin
        .from('cv_email_requests')
        .update({ status: 'failed', error_message: 'invalid_cv_state' })
        .eq('id', emailRequest.id);
      return redirectTo('invalid');
    }

    try {
      const pdfBuffer = await generateCvPdfBuffer(cvState);

      const safeName = String(cvState?.personalInfo?.fullName || 'CV')
        .trim()
        .replace(/\s+/g, '_')
        .replace(/[^a-zA-Z0-9_-]/g, '');
      const filename = `${safeName || 'CV'}_CV.pdf`;

      await sendCvPdfEmail(emailRequest.email, filename, pdfBuffer);

      const nowIso = new Date().toISOString();
      await supabaseAdmin
        .from('cv_email_requests')
        .update({
          status: 'sent',
          verified_at: nowIso,
          sent_at: nowIso,
          error_message: null,
        })
        .eq('id', emailRequest.id);

      if (emailRequest.fingerprint) {
        const { data: session } = await supabaseAdmin
          .from('anonymous_sessions')
          .select('used_count')
          .eq('fingerprint', emailRequest.fingerprint)
          .maybeSingle();

        if (session) {
          await supabaseAdmin
            .from('anonymous_sessions')
            .update({ used_count: session.used_count + 1 })
            .eq('fingerprint', emailRequest.fingerprint);
        } else {
          await supabaseAdmin
            .from('anonymous_sessions')
            .insert({ fingerprint: emailRequest.fingerprint, used_count: 1 });
        }
      }

      return redirectTo('sent');
    } catch (sendError) {
      await supabaseAdmin
        .from('cv_email_requests')
        .update({ status: 'failed', error_message: toSafeErrorMessage(sendError) })
        .eq('id', emailRequest.id);

      console.error('cv/email/verify send error:', sendError);
      return redirectTo('failed');
    }
  } catch (err) {
    console.error('cv/email/verify error:', err);
    return redirectTo('failed');
  }
}

