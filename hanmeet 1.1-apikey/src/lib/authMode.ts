export type AuthMode = 'guest' | 'cloud';

const AUTH_MODE_KEY = 'hanmeet-auth-mode';
const AUTH_MODE_EVENT = 'hanmeet-auth-mode-changed';

export function getAuthModePreference(): AuthMode {
  const raw = localStorage.getItem(AUTH_MODE_KEY);
  if (raw === 'cloud') return 'cloud';
  return 'guest';
}

export function setAuthModePreference(mode: AuthMode): void {
  localStorage.setItem(AUTH_MODE_KEY, mode);
  window.dispatchEvent(new CustomEvent<AuthMode>(AUTH_MODE_EVENT, { detail: mode }));
}

export function subscribeAuthModePreference(listener: (mode: AuthMode) => void): () => void {
  const onChanged = (event: Event) => {
    const custom = event as CustomEvent<AuthMode>;
    listener(custom.detail === 'cloud' ? 'cloud' : 'guest');
  };

  window.addEventListener(AUTH_MODE_EVENT, onChanged);
  return () => window.removeEventListener(AUTH_MODE_EVENT, onChanged);
}

