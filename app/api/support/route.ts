import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { createClient } from '@/lib/supabase-server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, message } = body;

    if (!email || !message) {
      return NextResponse.json({ error: 'Email and message are required' }, { status: 400 });
    }

    let userId = null;
    try {
      const supabaseServer = createClient();
      const { data: { user } } = await supabaseServer.auth.getUser();
      if (user) {
        userId = user.id;
      }
    } catch (e) {
      // Ignore auth errors, might be an anonymous user
      console.log('No active session or error fetching user for support ticket');
    }

    const { error } = await supabaseAdmin
      .from('support_tickets')
      .insert({
        email,
        message,
        user_id: userId,
      });

    if (error) {
      console.error('Error inserting support ticket:', error);
      return NextResponse.json({ error: 'Failed to submit ticket' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in support route:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
