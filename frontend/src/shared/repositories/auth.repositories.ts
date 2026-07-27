import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | null = null;

export function getSupabaseClient() {
  if (client) return client;
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error('Supabase authentication is not configured.');
  client = createClient(url, key, {
    auth: { storage: sessionStorage, persistSession: true, autoRefreshToken: true },
  });
  return client;
}

export async function getAccessToken() {
  const { data } = await getSupabaseClient().auth.getSession();
  return data.session?.access_token ?? null;
}

export async function signIn(email: string, password: string) {
  const { error } = await getSupabaseClient().auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
}

export function signOut() {
  return getSupabaseClient().auth.signOut();
}
