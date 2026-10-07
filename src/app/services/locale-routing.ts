import { CanMatchFn, UrlSegment } from '@angular/router';

export type Lang = 'fr' | 'en' | 'ar' | 'de' | 'es' | 'it' | 'pt' | 'tr' | 'fa' | 'ur' | 'ps';

/** Single source of truth for which languages get their own URL segment
 * (`/fr/...`, `/ar/...`) — must stay in sync with I18nService's own
 * `Lang` union and with `src/assets/i18n/*.json`. */
export const SUPPORTED_LANGS: Lang[] = ['fr', 'en', 'ar', 'de', 'es', 'it', 'pt', 'tr', 'fa', 'ur', 'ps'];

/** Right-to-left scripts among the supported languages — Arabic, Persian,
 * Urdu and Pashto all use RTL-written (Perso-)Arabic script, unlike every
 * other supported language here. */
export const RTL_LANGS: Lang[] = ['ar', 'fa', 'ur', 'ps'];

export function isRtlLang(lang: Lang): boolean {
  return (RTL_LANGS as string[]).includes(lang);
}

/** French is Morocco's primary language and the app's original default —
 * used as the `x-default`/fallback hreflang target and as the language a
 * bare, unprefixed URL falls back to server-side (no request-language
 * detection there; see I18nService for the browser-side detection). */
export const DEFAULT_LANG: Lang = 'fr';

/** Best supported language from an HTTP Accept-Language header ("de-DE,de;q=0.9,en;q=0.8"),
 * honouring q-values; null when the header is missing or lists no supported language. The server
 * uses this for a first-ever visit (no cookie yet), so a German browser lands on /de, not /fr. */
export function langFromAcceptLanguage(header: string | null | undefined): Lang | null {
  if (!header) return null;
  const ranked = header
    .split(',')
    .map((part, index) => {
      const [tag, ...params] = part.trim().split(';');
      const q = params.map(p => p.trim()).find(p => p.startsWith('q='));
      const weight = q ? parseFloat(q.slice(2)) : 1;
      return { code: (tag ?? '').slice(0, 2).toLowerCase(), weight: Number.isFinite(weight) ? weight : 0, index };
    })
    .filter(c => c.weight > 0 && isSupportedLang(c.code))
    .sort((a, b) => b.weight - a.weight || a.index - b.index);
  return (ranked[0]?.code as Lang | undefined) ?? null;
}

export function isSupportedLang(value: string | null | undefined): value is Lang {
  return !!value && (SUPPORTED_LANGS as string[]).includes(value);
}

/** `canMatch` guard for the locale-prefixed route tree. A plain
 * `path: ':lang'` param would happily swallow ANY first segment (including
 * real routes like `/annonces` when someone lands on a bare URL) — this
 * guard only lets the route match when the segment is one of the real
 * language codes, so unprefixed URLs correctly fall through to the
 * root-level redirect route instead.
 *
 * This used to be a custom `UrlMatcher`, which achieves the same client-side
 * behavior but silently breaks `@angular/ssr`'s server-route-config
 * matching: `ServerRoute`s are matched by walking `route.path` strings, and
 * a `matcher`-based route has no static `path` for that walk to follow (it
 * falls back to a literal `'**'`, which then poisons every descendant path
 * computed from it). Keeping `path: ':lang'` as a real path segment and
 * gating it with `canMatch` instead keeps `app.routes.server.ts`'s
 * `:lang/...` entries meaningful. */
export const localeCanMatch: CanMatchFn = (_route, segments: UrlSegment[]) => {
  const first = segments[0];
  return !!first && isSupportedLang(first.path);
};

/** Prefixes an absolute routerLink/router.navigate command array with a
 * language segment, e.g. `withLang(['/annonces', id], 'ar')` ->
 * `['/ar/annonces', id]`. Relative commands (not starting with '/'),
 * empty arrays and non-string first commands pass through untouched —
 * covers cases like `router.navigate([], { queryParams })` used to update
 * only the query string on the current page. */
export function withLang(commands: ReadonlyArray<unknown>, lang: Lang): unknown[] {
  if (!Array.isArray(commands) || commands.length === 0) return commands as unknown[];
  const first = commands[0];
  if (typeof first !== 'string' || !first.startsWith('/')) return commands as unknown[];
  const rest = first === '/' ? '' : first;
  return [`/${lang}${rest}`, ...commands.slice(1)];
}

/** Strips a leading `/xx` language segment off a router URL (path only,
 * `router.url` style), used by SeoService to rebuild the same path under
 * each of the other languages for hreflang alternates. Returns the path
 * unchanged if it has no recognized language prefix. */
export function stripLangPrefix(urlPath: string): string {
  const match = urlPath.match(/^\/([a-z]{2})(\/.*|$)/);
  if (match && isSupportedLang(match[1])) return match[2] || '/';
  return urlPath;
}
