import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';

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
// 'unsafe-inline' remains for scripts/styles because Angular's server rendering
// emits inline hydration and style blocks.
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com",
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self' data:",
  "img-src 'self' data: blob: https://res.cloudinary.com https://*.tile.openstreetmap.org",
  "connect-src 'self' https://challenges.cloudflare.com",
  "frame-src https://challenges.cloudflare.com",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "media-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
].join('; ');

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(self), geolocation=(self), payment=(), usb=()');
  if (IS_PRODUCTION) {
    const https = req.headers['x-forwarded-proto'] === 'https';
    res.setHeader('Content-Security-Policy', https ? CSP + '; upgrade-insecure-requests' : CSP);
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
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
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
