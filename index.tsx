import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { supabase, isSupabaseConfigured } from './src/lib/supabase';

/**
 * Auth callback handler (runs before React mounts).
 *
 * Magic-link / password-reset / signup-confirm e-mails redirect to the site
 * root `/?next=<route>&code=<pkce-code>`. We exchange the PKCE code for a
 * session here, then drop the query and enter the hash-routed SPA at `<next>`.
 * Doing this before mounting avoids a flash of the (unauthenticated) login
 * screen and any router race. Triggered by the presence of `code`/`error`
 * (any path), so it also covers the legacy `/auth/callback` target.
 */
async function handleAuthCallback(): Promise<void> {
  if (!isSupabaseConfigured) return;
  const { pathname, search, origin } = window.location;
  const params = new URLSearchParams(search);
  const isCallback = pathname.replace(/\/+$/, '').endsWith('/auth/callback');
  if (!isCallback && !params.has('code') && !params.has('error')) return;

  let next = params.get('next') || '/dashboard';
  if (!next.startsWith('/')) next = `/${next}`;

  if (params.has('error')) {
    console.warn('[Auth] callback error:', params.get('error_description') || params.get('error'));
    next = '/login/broker';
  } else if (params.has('code')) {
    try {
      // exchangeCodeForSession expects the CODE value (not the full URL); it
      // posts it as `auth_code` together with the stored PKCE verifier.
      const { error } = await supabase.auth.exchangeCodeForSession(params.get('code') as string);
      if (error) {
        console.warn('[Auth] exchangeCodeForSession failed:', error.message);
        next = '/login/broker';
      }
    } catch (e) {
      console.warn('[Auth] exchangeCodeForSession threw:', (e as Error).message);
      next = '/login/broker';
    }
  }

  // Replace the address bar with the clean hash route (removes the code/query).
  window.history.replaceState({}, '', `${origin}/#${next}`);
}

async function bootstrap(): Promise<void> {
  try {
    await handleAuthCallback();
  } catch (e) {
    console.warn('[Auth] callback handling failed:', (e as Error).message);
  }

  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error('Could not find root element to mount to');
  }

  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}

bootstrap();
