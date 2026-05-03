import React, { useEffect, useMemo, useState } from 'react';
import { AuthMode, getAuthModePreference, setAuthModePreference } from '../../../lib/authMode';
import { sendMagicLink, signOut } from '../authService';
import { useAuthSession } from '../hooks/useAuthSession';

interface AuthGateProps {
  children: React.ReactNode;
}

export function AuthGate({ children }: AuthGateProps) {
  const { loading, session, isEnabled } = useAuthSession();
  const [mode, setMode] = useState<AuthMode>(() => getAuthModePreference());
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isEnabled) {
      setMode('guest');
    }
  }, [isEnabled]);

  useEffect(() => {
    setAuthModePreference(mode);
  }, [mode]);

  const userEmail = useMemo(() => session?.user?.email || null, [session]);
  const needsLogin = mode === 'cloud' && isEnabled && !session;

  const handleMagicLink = async (event: React.FormEvent) => {
    event.preventDefault();
    const normalizedEmail = email.trim();
    if (!normalizedEmail) {
      setMessage('Enter an email first.');
      return;
    }

    setSubmitting(true);
    const result = await sendMagicLink(normalizedEmail);
    setMessage(result.message);
    setSubmitting(false);
  };

  const handleSignOut = async () => {
    await signOut();
    setMode('guest');
    setMessage('Signed out. Guest mode is active.');
  };

  if (needsLogin) {
    return (
      <div className="min-h-screen bg-[#f7f2e7] text-zinc-900 flex items-center justify-center p-5">
        <div className="max-w-xl w-full bg-white border-4 border-black p-6 shadow-[8px_8px_0_0_rgba(0,0,0,1)] space-y-4">
          <h2 className="text-2xl font-bold">Sign In</h2>
          <p className="text-sm opacity-75">
            Use magic link login for cloud-ready mode. You can continue in guest mode anytime.
          </p>

          <form onSubmit={handleMagicLink} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full border-2 border-black px-3 py-2"
              placeholder="you@example.com"
              required
            />
            <div className="flex flex-wrap gap-2">
              <button
                type="submit"
                disabled={submitting || loading}
                className="px-3 py-2 border-2 border-black bg-black text-white disabled:opacity-50"
              >
                {submitting ? 'Sending...' : 'Send Magic Link'}
              </button>
              <button
                type="button"
                onClick={() => setMode('guest')}
                className="px-3 py-2 border-2 border-black bg-white"
              >
                Continue as Guest
              </button>
            </div>
          </form>

          {message && <p className="text-sm text-zinc-700">{message}</p>}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-black text-white px-4 py-2 text-xs flex flex-wrap gap-2 items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="uppercase tracking-wide opacity-70">Mode</span>
          <button
            onClick={() => setMode('guest')}
            className={`px-2 py-1 border ${mode === 'guest' ? 'bg-white text-black border-white' : 'border-white/50'}`}
          >
            Guest
          </button>
          <button
            onClick={() => setMode('cloud')}
            disabled={!isEnabled || loading}
            className={`px-2 py-1 border disabled:opacity-50 ${mode === 'cloud' ? 'bg-emerald-300 text-black border-emerald-300' : 'border-white/50'}`}
          >
            Cloud
          </button>
        </div>

        <div className="flex items-center gap-2">
          {!isEnabled && (
            <span className="opacity-70">
              Supabase not configured. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
            </span>
          )}
          {isEnabled && userEmail && (
            <>
              <span>{userEmail}</span>
              <button onClick={handleSignOut} className="px-2 py-1 border border-white/50">
                Sign Out
              </button>
            </>
          )}
          {isEnabled && !userEmail && mode === 'guest' && (
            <span className="opacity-80">Cloud mode available (magic link).</span>
          )}
        </div>
      </div>

      {children}
    </>
  );
}
