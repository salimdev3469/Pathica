import { supabaseAdmin } from './lib/supabase-server';

async function run() {
  const { data, error } = await supabaseAdmin
    .from('dodo_payments')
    .select('id, user_id, status, dodo_session_id, dodo_payment_id, created_at')
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error(error);
  } else {
    console.log(JSON.stringify(data, null, 2));
  }
}

run();
