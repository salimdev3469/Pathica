import { supabaseAdmin } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

export async function listAllUsers(): Promise<User[]> {
  const { data, error } = await supabaseAdmin.auth.admin.listUsers();
  
  if (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
  
  return data.users || [];
}

export type LoginLog = {
  id: string;
  user_id: string;
  email: string;
  login_at: string;
};

export async function listLoginLogs(): Promise<LoginLog[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('user_login_logs')
      .select('*')
      .order('login_at', { ascending: false })
      .limit(200);

    if (error) {
      if (error.code === '42P01') {
        // Table doesn't exist yet, return empty array silently
        return [];
      }
      console.error('Error fetching login logs:', error);
      return [];
    }

    return data as LoginLog[];
  } catch (error) {
    console.error('Unexpected error fetching login logs:', error);
    return [];
  }
}
