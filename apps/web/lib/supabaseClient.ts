import { createClient } from '@supabase/supabase-js';

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  rawUrl && 
  rawUrl.startsWith('https://') && 
  !rawUrl.includes('demo-project') &&
  rawKey &&
  !rawKey.includes('demo_anon_key')
);

// Fallback to safe dummy URL if env vars not provided, to prevent SDK initialization crashes
const supabaseUrl = isSupabaseConfigured ? rawUrl : 'https://localhost.supabase.co';
const supabaseAnonKey = isSupabaseConfigured ? rawKey : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Helper to fetch current session access_token for API Authorization header
 */
export async function getSupabaseAuthHeader(): Promise<Record<string, string>> {
  try {
    if (isSupabaseConfigured) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        return { Authorization: `Bearer ${session.access_token}` };
      }
    }
  } catch (err) {
    console.warn('Supabase session fetch warning:', err);
  }

  if (typeof window !== 'undefined') {
    const localToken = localStorage.getItem('token');
    if (localToken) {
      return { Authorization: `Bearer ${localToken}` };
    }
  }
  return {};
}
