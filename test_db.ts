import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function check() {
  const { data, error } = await supabaseAdmin
    .from('cvs')
    .select('cv_state')
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) {
    console.error('Error fetching:', error);
  } else {
    console.log(JSON.stringify(data?.[0]?.cv_state, null, 2));
  }
}

check();
