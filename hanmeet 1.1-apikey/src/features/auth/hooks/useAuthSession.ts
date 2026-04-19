import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { isSupabaseEnabled } from '../../../lib/supabaseClient';
import { getCurrentSession, subscribeToAuthSession } from '../authService';

interface UseAuthSessionResult {
  loading: boolean;
  session: Session | null;
  isEnabled: boolean;
}

export function useAuthSession(): UseAuthSessionResult {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseEnabled) {
      setLoading(false);
      return;
    }

    let active = true;
    getCurrentSession()
      .then((current) => {
        if (!active) return;
        setSession(current);
        setLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setSession(null);
        setLoading(false);
      });

    const unsubscribe = subscribeToAuthSession((nextSession) => {
      setSession(nextSession);
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  return {
    loading,
    session,
    isEnabled: isSupabaseEnabled,
  };
}
