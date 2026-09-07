/** Cloudflare Turnstile site key — public by design (unlike the secret key,
 * which lives only in the backend's .env). Get one for free at
 * https://dash.cloudflare.com -> Turnstile -> Add widget.
 * Left empty, the widget below auto-passes with a fixed dev token and the
 * backend accepts it (see TURNSTILE_SECRET_KEY in soukmar-backend/.env). */
export const TURNSTILE_SITE_KEY = '';
