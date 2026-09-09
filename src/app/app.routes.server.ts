import { RenderMode, ServerRoute } from '@angular/ssr';

// Every route here serves fully dynamic, live DB-backed content (listings,
// conversations, user profiles) — Prerender would bake in stale data at
// build time and can't enumerate per-listing routes anyway, so everything
// renders per-request instead.
export const serverRoutes: ServerRoute[] = [
  {
    path: '**',
    renderMode: RenderMode.Server
  }
];
