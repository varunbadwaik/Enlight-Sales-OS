import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://demo-project.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.demo_anon_key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Helper to fetch current session access_token for API Authorization header
 */
export async function getSupabaseAuthHeader(): Promise<Record<string, string>> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      return { Authorization: `Bearer ${session.access_token}` };
    }
  } catch (err) {
    console.warn('Supabase session fetch warning:', err);
  }
  return {};
}
