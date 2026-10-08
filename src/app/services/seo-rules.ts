import { DEFAULT_LANG, INDEXABLE_LANGS, isIndexableLang, isSupportedLang } from './locale-routing';

export const SITE_URL = 'https://souqmar24.com';

/** How a route is treated by search engines:
 * - `index`: a public page worth indexing (default)
 * - `noindex`: public but thin or duplicate-prone (kept out of the index, links still followed)
 * - `private`: login, account and admin pages (neither indexed nor followed) */
export type SeoMode = 'index' | 'noindex' | 'private';

export interface SeoDecision {
  /** Absolute canonical URL, or null for URLs without a language prefix (those only redirect). */
  canonical: string | null;
  /** Value of `<meta name="robots">`. */
  robots: string;
  /** `hreflang` alternates — only for indexable pages and only for languages that are real, reviewed versions. */
  hreflang: { lang: string; href: string }[];
}

const INDEX_ROBOTS = 'index, follow, max-image-preview:large';

/**
 * One place that decides canonical URL, robots and hreflang for a page, from its URL and route mode.
 *
 * - The query string never reaches the canonical URL, except `?categorie=` on the listings page — that is
 *   the one real, worth-indexing landing page per category.
 * - Any other query on the listings page (sorting, price, city, page…) is a filter variant: canonical to the
 *   base page and `noindex, follow`, so endless filter combinations stay out of the index.
 * - Languages that are not in INDEXABLE_LANGS stay usable but are kept out of the index and out of the
 *   hreflang cluster until their translations are reviewed.
 */
export function decideSeo(url: string, mode: SeoMode = 'index'): SeoDecision {
  const withoutHash = url.split('#')[0] ?? '';
  const [rawPath = '', query = ''] = withoutHash.split('?');
  const match = rawPath.match(/^\/([a-z]{2})(\/.*)?$/);
  const lang = match?.[1];
  if (!lang || !isSupportedLang(lang)) return { canonical: null, robots: 'noindex, follow', hreflang: [] };

  const bare = (match?.[2] ?? '').replace(/\/+$/, ''); // '' = home
  const params = new URLSearchParams(query);
  const isListingsPage = bare === '/annonces';
  const category = isListingsPage ? params.get('categorie') : null;
  const kept = category ? `?categorie=${encodeURIComponent(category)}` : '';
  const hasFilterVariant = isListingsPage && [...params.keys()].some(k => k !== 'categorie');

  const canonical = `${SITE_URL}/${lang}${bare}${kept}`;

  let robots = INDEX_ROBOTS;
  if (mode === 'private') robots = 'noindex, nofollow';
  else if (mode === 'noindex' || !isIndexableLang(lang) || hasFilterVariant) robots = 'noindex, follow';

  const indexable = robots === INDEX_ROBOTS;
  const hreflang = indexable
    ? [
        ...INDEXABLE_LANGS.map(l => ({ lang: l as string, href: `${SITE_URL}/${l}${bare}${kept}` })),
        { lang: 'x-default', href: `${SITE_URL}/${DEFAULT_LANG}${bare}${kept}` },
      ]
    : [];

  return { canonical, robots, hreflang };
}
