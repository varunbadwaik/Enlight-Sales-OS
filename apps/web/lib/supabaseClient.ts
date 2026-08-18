import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isRealSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseUrl.startsWith('https://') &&
  !supabaseUrl.includes('demo-project.supabase.co')
);

// Fallback client placeholder if not configured
export const supabase = createClient(
  isRealSupabaseConfigured ? supabaseUrl : 'https://placeholder.supabase.co',
  isRealSupabaseConfigured ? supabaseAnonKey : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder'
);

/**
 * Helper to fetch current session access_token for API Authorization header
 */
export async function getSupabaseAuthHeader(): Promise<Record<string, string>> {
  if (!isRealSupabaseConfigured) return {};
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
