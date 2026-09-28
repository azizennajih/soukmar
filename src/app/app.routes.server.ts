import { RenderMode, ServerRoute } from '@angular/ssr';

// Auth is purely localStorage-based (see AuthService) — invisible to the
// server. If these private, login-only pages were server-rendered, every
// one of them would see isLoggedIn === false on the server and their
// ngOnInit's auth guard would redirect to /auth/login — turning into a
// real HTTP redirect that bounces even an actually logged-in user away
// the moment they refresh or open the URL directly. Rendering them
// client-side only sidesteps the problem entirely and matches the private
// route list already used for robots.txt (soukmar-backend/src/lib/sitemap.ts).
const CLIENT_ONLY_PATHS = ['admin', 'parametres', 'chat', 'mes-annonces', 'mes-favoris', 'mes-abonnements', 'notifications', 'profil', 'recherches-sauvegardees', 'supprimer-compte'];

// Everything now lives under a `/:lang` prefix (see app.routes.ts's `:lang`
// route) — this table matches against the actual request URL, so each path
// needs the `:lang` segment too, or `/fr/admin` etc would fall through to
// the catch-all Server rendering below instead of Client. A bare,
// unprefixed `/admin` still hits the catch-all, but that's fine: the app's
// own router only ever redirects it to `/fr/admin` there (see
// app.routes.ts's root '**' redirect) rather than rendering the page, and
// Angular's SSR renderer turns that in-flight redirect into a real HTTP
// redirect instead of attempting to render.
//
// The `:lang` entry on its own (no trailing path) is required too, even
// though nothing renders at that exact URL: @angular/ssr matches every
// route in the Angular router config — including the `:lang` parent route
// itself, not just its children — against this table by walking its static
// `path`, and errors out (skipping the whole subtree) if a route has no
// match here. Without it, none of the entries below would ever be reached.
//
// Everything else serves fully dynamic, live DB-backed content (listings,
// conversations, user profiles) — Prerender would bake in stale data at
// build time and can't enumerate per-listing routes anyway, so it renders
// per-request instead.
export const serverRoutes: ServerRoute[] = [
  { path: ':lang', renderMode: RenderMode.Server },
  ...CLIENT_ONLY_PATHS.map((path): ServerRoute => ({ path: `:lang/${path}`, renderMode: RenderMode.Client })),
  {
    path: '**',
    renderMode: RenderMode.Server
  }
];
