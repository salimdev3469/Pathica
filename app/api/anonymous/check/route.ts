import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: Request) {
    try {
        const { fingerprint } = await req.json();
        if (!fingerprint) return NextResponse.json({ error: 'Fingerprint required' }, { status: 400 });

        const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';

        // Get session
        let { data: session } = await supabaseAdmin
            .from('anonymous_sessions')
            .select('used_count')
            .eq('fingerprint', fingerprint)
            .single();

        if (!session) {
            // Create session if it doesn't exist
            const { data: newSession, error: insertError } = await supabaseAdmin
                .from('anonymous_sessions')
                .insert([{ fingerprint, ip, used_count: 0 }])
                .select()
                .single();

            if (insertError) {
                console.error('Insert error', insertError);
                // Fallback to allow if DB fails
                return NextResponse.json({ used_count: 0 });
            }
            session = newSession;
        }

        return NextResponse.json({ used_count: session?.used_count || 0 });
    } catch (error: any) {
        console.error('Anonymous check error:', error);
        // On failure securely fallback to 0 to not block innocent user because of DB issue during dev
        return NextResponse.json({ used_count: 0 }, { status: 500 });
    }
}
