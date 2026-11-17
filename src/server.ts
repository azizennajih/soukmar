import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { DEFAULT_LANG, isSupportedLang, langFromAcceptLanguage } from './app/services/locale-routing';

const browserDistFolder = join(import.meta.dirname, '../browser');
const BACKEND_URL = process.env['BACKEND_URL'] || 'http://127.0.0.1:3000';

const app = express();
const angularApp = new AngularNodeAppEngine();
const IS_PRODUCTION = process.env['NODE_ENV'] === 'production';

app.disable('x-powered-by');

// Browser-side hardening for every page (production only — the dev server's live
// reload needs eval/websockets that this policy would block).
//
// The policy pins every place the page may load code or data from: our own
// origin, Cloudflare Turnstile (bot check), Cloudinary (photos), OpenStreetMap
// (map tiles). Fonts and the country lookup are served by ourselves. Even if some HTML
// were ever injected, a stolen login token could not be sent to an attacker's
// server (connect-src) and no foreign script could be pulled in (script-src).
// Scripts: no 'unsafe-inline'. The few inline scripts Angular's server rendering emits (event replay,
// stylesheet swap) are allowed by their SHA-256 hash, computed per rendered page (cspFor below), so an
// injected <script> cannot run. 'unsafe-inline' remains for styles only: Angular emits inline style
// blocks and bindings, and injected styles cannot run code or send data (connect-src).
const CSP = [
  "default-src 'self'",
  "script-src 'self' https://challenges.cloudflare.com https://accounts.google.com https://connect.facebook.net",
  "style-src 'self' 'unsafe-inline' https://accounts.google.com",
  "font-src 'self' data:",
  "img-src 'self' data: blob: https://res.cloudinary.com https://*.tile.openstreetmap.org",
  "connect-src 'self' https://challenges.cloudflare.com https://accounts.google.com https://*.facebook.com https://connect.facebook.net",
  "frame-src https://challenges.cloudflare.com https://accounts.google.com https://*.facebook.com",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "media-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
].join('; ');

/** CSP for one response; `scriptHashes` are the inline scripts of that very page. */
function cspFor(https: boolean, scriptHashes: string[] = []): string {
  const base = scriptHashes.length ? CSP.replace("script-src 'self'", `script-src 'self' ${scriptHashes.join(' ')}`) : CSP;
  return https ? base + '; upgrade-insecure-requests' : base;
}

/** SHA-256 source expressions of every executable inline <script> of an HTML page (data blocks such as
 * application/json and ld+json are never executed, so they need none). */
function inlineScriptHashes(html: string): string[] {
  const hashes = new Set<string>();
  for (const m of html.matchAll(/<script(\s[^>]*)?>([\s\S]*?)<\/script>/gi)) {
    const attrs = m[1] ?? '';
    if (/\ssrc\s*=/i.test(attrs)) continue;
    const type = /\stype\s*=\s*["']?([^"'\s>]+)/i.exec(attrs)?.[1]?.toLowerCase();
    if (type && type !== 'text/javascript' && type !== 'module') continue;
    if (!m[2]) continue;
    hashes.add(`'sha256-${createHash('sha256').update(m[2], 'utf8').digest('base64')}'`);
  }
  return [...hashes];
}

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(self), geolocation=(self), payment=(), usb=()');
  if (IS_PRODUCTION) {
    const https = req.headers['x-forwarded-proto'] === 'https';
    res.setHeader('Content-Security-Policy', cspFor(https));
  }
  next();
});

// robots.txt and sitemap.xml must live at this app's own domain root to be
// found by crawlers, but the data (live listings) lives in the backend —
// so this just passes the backend's already-built response straight through
// instead of duplicating database access into the frontend server.
app.get(['/robots.txt', '/sitemap.xml'], async (req, res) => {
  try {
    const upstream = await fetch(`${BACKEND_URL}${req.path}`);
    res.status(upstream.status);
    res.set('Content-Type', upstream.headers.get('content-type') || 'text/plain');
    res.send(await upstream.text());
  } catch (e) {
    console.error(e);
    res.status(502).send('Erreur serveur.');
  }
});

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Old or hand-typed links without a language prefix (/auth/login, /annonces/abc123) get the
 * prefix added with the full path and query kept: /de/auth/login. The router's own wildcard
 * redirect only handled one-segment URLs correctly (it cut /auth/login down to /auth).
 * Language: an explicit earlier choice (cookie) wins, then the browser's Accept-Language.
 */
app.use((req, res, next) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') { next(); return; }
  const segments = req.path.split('/').filter(Boolean);
  if (segments.length < 2 || isSupportedLang(segments[0]) || segments[0].includes('.')) { next(); return; }

  const cookies = req.headers.cookie ?? '';
  const read = (name: string) => decodeURIComponent(cookies.match(new RegExp('(?:^|;\\s*)' + name + '=([^;]+)'))?.[1] ?? '');
  const explicit = read('soukmar_lang_explicit') === '1' ? read('soukmar_lang') : '';
  const lang = isSupportedLang(explicit) ? explicit : (langFromAcceptLanguage(req.headers['accept-language']) ?? DEFAULT_LANG);
  // The target depends on the visitor's cookie / browser language, so caches and crawlers must not reuse it for others.
  res.setHeader('Vary', 'Accept-Language, Cookie');
  res.redirect(302, '/' + lang + req.originalUrl);
});

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then(async (response) => {
      if (!response) { next(); return; }
      if (IS_PRODUCTION && (response.headers.get('content-type') ?? '').includes('text/html')) {
        // Allow exactly this page's inline scripts by hash (see the CSP comment above).
        const html = await response.text();
        const headers = new Headers(response.headers);
        headers.set('Content-Security-Policy', cspFor(req.headers['x-forwarded-proto'] === 'https', inlineScriptHashes(html)));
        headers.delete('content-length');
        await writeResponseToNodeResponse(new Response(html, { status: response.status, statusText: response.statusText, headers }), res);
        return;
      }
      await writeResponseToNodeResponse(response, res);
    })
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  // Behind the reverse proxy the site only needs to listen locally.
  const host = process.env['HOST'] || (IS_PRODUCTION ? '127.0.0.1' : undefined);
  const onListening = (error?: Error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://${host ?? 'localhost'}:${port}`);
  };
  if (host) app.listen(Number(port), host, onListening); else app.listen(port, onListening);
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
