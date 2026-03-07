import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

function isMissingAnonymousSessionsTable(error: { code?: string; message?: string } | null) {
  if (!error) return false;
  return error.code === 'PGRST205' && (error.message || '').includes("public.anonymous_sessions");
}

export async function POST(req: Request) {
  try {
    const { fingerprint } = await req.json();
    if (!fingerprint) return NextResponse.json({ error: 'Fingerprint required' }, { status: 400 });

    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';

    const { data: session, error: sessionError } = await supabaseAdmin
      .from('anonymous_sessions')
      .select('used_count')
      .eq('fingerprint', fingerprint)
      .maybeSingle();

    if (sessionError) {
      if (isMissingAnonymousSessionsTable(sessionError)) {
        console.warn('anonymous_sessions table is missing; skipping anonymous limit check.');
        return NextResponse.json({ used_count: 0 });
      }

      console.error('Anonymous check read error:', sessionError);
      return NextResponse.json({ used_count: 0 }, { status: 500 });
    }

    if (!session) {
      const { data: newSession, error: insertError } = await supabaseAdmin
        .from('anonymous_sessions')
        .insert([{ fingerprint, ip, used_count: 0 }])
        .select('used_count')
        .single();

      if (insertError) {
        if (isMissingAnonymousSessionsTable(insertError)) {
          console.warn('anonymous_sessions table is missing; skipping anonymous limit check.');
          return NextResponse.json({ used_count: 0 });
        }

        console.error('Anonymous check insert error:', insertError);
        return NextResponse.json({ used_count: 0 });
      }

      return NextResponse.json({ used_count: newSession?.used_count || 0 });
    }

    return NextResponse.json({ used_count: session.used_count || 0 });
  } catch (error) {
    console.error('Anonymous check error:', error);
    return NextResponse.json({ used_count: 0 }, { status: 500 });
  }
}
