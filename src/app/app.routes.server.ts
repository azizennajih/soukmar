import { RenderMode, ServerRoute } from '@angular/ssr';

// Auth is purely localStorage-based (see AuthService) — invisible to the
// server. If these private, login-only pages were server-rendered, every
// one of them would see isLoggedIn === false on the server and their
// ngOnInit's auth guard would redirect to /auth/login — turning into a
// real HTTP redirect that bounces even an actually logged-in user away
// the moment they refresh or open the URL directly. Rendering them
// client-side only sidesteps the problem entirely and matches the private
// route list already used for robots.txt (soukmar-backend/src/lib/sitemap.ts).
const CLIENT_ONLY_PATHS = ['admin', 'parametres', 'chat', 'mes-annonces', 'mes-favoris', 'notifications', 'profil', 'recherches-sauvegardees', 'supprimer-compte'];

// Everything now lives under a `/:lang` prefix (see app.routes.ts's
// localeUrlMatcher) — this table matches against the actual request URL,
// so each path needs the `:lang` segment too, or `/fr/admin` etc would
// fall through to the catch-all Server rendering below instead of Client.
// A bare, unprefixed `/admin` still hits the catch-all, but that's fine:
// the app's own router only ever redirects it to `/fr/admin` there (see
// app.routes.ts's root '**' redirect) rather than rendering the page, and
// Angular's SSR renderer turns that in-flight redirect into a real HTTP
// redirect instead of attempting to render.
//
// Everything else serves fully dynamic, live DB-backed content (listings,
// conversations, user profiles) — Prerender would bake in stale data at
// build time and can't enumerate per-listing routes anyway, so it renders
// per-request instead.
export const serverRoutes: ServerRoute[] = [
  ...CLIENT_ONLY_PATHS.map((path): ServerRoute => ({ path: `:lang/${path}`, renderMode: RenderMode.Client })),
  {
    path: '**',
    renderMode: RenderMode.Server
  }
];
