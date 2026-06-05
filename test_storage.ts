import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function check() {
  const { data, error } = await supabaseAdmin.storage
    .from('resume_reviews_files')
    .upload('test-user/test-file.pdf', Buffer.from('test'), { contentType: 'application/pdf' });
  console.log({ data, error });
}

check();
