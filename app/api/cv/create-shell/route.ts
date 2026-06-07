import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function POST(req: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const title = body.title || 'Imported CV';
    const cvId = crypto.randomUUID();

    const { data: cvRow, error } = await supabase
      .from('cvs')
      .insert([{ id: cvId, user_id: user.id, title }])
      .select('id')
      .single();

    if (error || !cvRow) {
      console.error('Failed to create CV shell:', error);
      throw new Error('Could not create CV shell.');
    }

    return NextResponse.json({ cvId: cvRow.id });
  } catch (error) {
    console.error('Create shell route error:', error);
    return NextResponse.json({ error: 'Failed to create CV shell.' }, { status: 500 });
  }
}
