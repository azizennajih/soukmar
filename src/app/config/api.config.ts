const LOCAL_BACKEND = 'http://127.0.0.1:3000';

/** Where the backend lives for the current runtime: the SSR server reaches it
 * directly (BACKEND_URL), local development uses :3000, and any other host
 * (production) uses its own origin — a reverse proxy forwards /api and
 * /socket.io to the backend there, so no backend URL is baked into the build. */
export function backendOrigin(): string {
  if (typeof window === 'undefined') return process.env['BACKEND_URL'] || LOCAL_BACKEND;
  const host = window.location.hostname;
  return host === 'localhost' || host === '127.0.0.1' ? LOCAL_BACKEND : window.location.origin;
}

export const apiBase = (): string => `${backendOrigin()}/api`;
