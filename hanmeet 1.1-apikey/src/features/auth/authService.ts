import type { Session } from '@supabase/supabase-js';
import { isSupabaseEnabled, supabase } from '../../lib/supabaseClient';

interface AuthResult {
  ok: boolean;
  message: string;
}

export async function getCurrentSession(): Promise<Session | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.auth.getSession();
  if (error) return null;
  return data.session;
}

export function subscribeToAuthSession(listener: (session: Session | null) => void): () => void {
  if (!supabase) return () => {};
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    listener(session);
  });
  return () => data.subscription.unsubscribe();
}

export async function sendMagicLink(email: string): Promise<AuthResult> {
  if (!supabase || !isSupabaseEnabled) {
    return {
      ok: false,
      message: 'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
    };
  }

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: window.location.origin,
    },
  });

  if (error) {
    return {
      ok: false,
      message: error.message || 'Failed to send magic link.',
    };
  }

  return {
    ok: true,
    message: 'Magic link sent. Check your email to finish sign-in.',
  };
}

export async function signOut(): Promise<void> {
  if (!supabase) return;
  await supabase.auth.signOut();
}

