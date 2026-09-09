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
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
