import { UrlMatchResult, UrlSegment } from '@angular/router';

export type Lang = 'fr' | 'en' | 'ar' | 'de' | 'es' | 'it';

/** Single source of truth for which languages get their own URL segment
 * (`/fr/...`, `/ar/...`) — must stay in sync with I18nService's own
 * `Lang` union and with `src/assets/i18n/*.json`. */
export const SUPPORTED_LANGS: Lang[] = ['fr', 'en', 'ar', 'de', 'es', 'it'];

/** French is Morocco's primary language and the app's original default —
 * used as the `x-default`/fallback hreflang target and as the language a
 * bare, unprefixed URL falls back to server-side (no request-language
 * detection there; see I18nService for the browser-side detection). */
export const DEFAULT_LANG: Lang = 'fr';

export function isSupportedLang(value: string | null | undefined): value is Lang {
  return !!value && (SUPPORTED_LANGS as string[]).includes(value);
}

/** Custom `UrlMatcher` for the locale-prefixed route tree. A plain
 * `path: ':lang'` param would happily swallow ANY first segment (including
 * real routes like `/annonces` when someone lands on a bare URL) — this
 * matcher only consumes the segment when it is one of the six real
 * language codes, so unprefixed URLs correctly fall through to the
 * root-level redirect route instead. */
export function localeUrlMatcher(segments: UrlSegment[]): UrlMatchResult | null {
  if (!segments.length) return null;
  const first = segments[0];
  if (!isSupportedLang(first.path)) return null;
  return { consumed: [first], posParams: { lang: first } };
}

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
