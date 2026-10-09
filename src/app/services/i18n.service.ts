import { Injectable, signal, computed, effect, inject, untracked, PLATFORM_ID, REQUEST } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { BrowserStorageService } from './browser-storage.service';
import { DEFAULT_LANG, isSupportedLang, isRtlLang, langFromAcceptLanguage, withLang as withLangCommands, type Lang } from './locale-routing';
import { COUNTRY_STORAGE_KEY, defaultLangForCountry } from '../models/country.model';

export type { Lang };

const LANG_KEY = 'soukmar_lang';
/** Set only by an actual manual pick (see `markLangExplicit`) — never by
 * LocaleShellComponent's routine `:lang`-segment-sync `setLang()` calls,
 * which also fire for the very first auto-detected redirect. Gates whether
 * `detectInitialLang()` may still override the stored language with a
 * fresher country/browser-based guess. */
const LANG_EXPLICIT_KEY = 'soukmar_lang_explicit';

const LANG_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year, matches CountryService's own cookie

type RequestLike = { headers: { get(name: string): string | null } } | null;

function readCookie(request: RequestLike, name: string): string | null {
  const cookieHeader = request?.headers.get('cookie');
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}

/** Mirrors CountryService's own initial-country resolution (cookie during
 * SSR, localStorage in the browser) without injecting CountryService itself
 * — see COUNTRY_STORAGE_KEY's doc comment in country.model.ts for why that
 * would be a circular DI dependency. */
function detectCountryHint(storage: BrowserStorageService, isBrowser: boolean, request: RequestLike): string | null {
  return isBrowser ? storage.getItem(COUNTRY_STORAGE_KEY) : readCookie(request, COUNTRY_STORAGE_KEY);
}

/** Same problem as detectCountryHint: an explicit language choice lives in
 * localStorage, which SSR can't see — without a cookie mirror, a bare
 * (unprefixed) URL hit fresh (no `:lang` segment for LocaleShellComponent to
 * pick up) would ignore a visitor's earlier manual pick and re-derive the
 * language from their country/browser every time. Written by markLangExplicit()
 * and the constructor's effect() below, alongside the localStorage writes. */
function detectStoredLang(storage: BrowserStorageService, isBrowser: boolean, request: RequestLike): { lang: string | null; explicit: boolean } {
  if (isBrowser) {
    return { lang: storage.getItem(LANG_KEY), explicit: storage.getItem(LANG_EXPLICIT_KEY) === '1' };
  }
  return { lang: readCookie(request, LANG_KEY), explicit: readCookie(request, LANG_EXPLICIT_KEY) === '1' };
}

type Dict = Record<string, unknown>;

/** The dictionaries are NOT bundled into the main download: every visitor reads one language, but the 11 files
 * together are 1.1 MB (about 370 KB gzipped) of the start-up JavaScript. Each one is its own chunk, fetched when
 * its language is first needed (see I18nService.load and the app initializer in app.config.ts). */
const LOADERS: Record<Lang, () => Promise<{ default: unknown }>> = {
  fr: () => import('../../assets/i18n/fr.json'),
  en: () => import('../../assets/i18n/en.json'),
  ar: () => import('../../assets/i18n/ar.json'),
  de: () => import('../../assets/i18n/de.json'),
  es: () => import('../../assets/i18n/es.json'),
  it: () => import('../../assets/i18n/it.json'),
  pt: () => import('../../assets/i18n/pt.json'),
  tr: () => import('../../assets/i18n/tr.json'),
  fa: () => import('../../assets/i18n/fa.json'),
  ur: () => import('../../assets/i18n/ur.json'),
  ps: () => import('../../assets/i18n/ps.json'),
};

/** Language segment of a URL path ("/de/annonces" -> "de"), or null. */
export function langFromPath(path: string | null | undefined): Lang | null {
  const first = (path ?? '').split('?')[0].split('/').filter(Boolean)[0]?.toLowerCase();
  return first && isSupportedLang(first) ? first : null;
}

/** An explicit earlier choice (via the language switcher) always wins.
 * Otherwise, the visitor's browsing country (IP-detected client-side, or
 * read from its cookie mirror during SSR — see detectCountryHint) is mapped
 * to its likely language (e.g. USA -> English) so a first-time visitor sees
 * a sensible default for where they are, not always French. Failing that,
 * on the browser only, a supported language among `navigator.languages` is
 * tried. A genuinely first-ever visit (no country cookie yet, client-side IP
 * lookup still pending) falls back to DEFAULT_LANG until CountryService's
 * detection resolves and calls `setLangFromCountry()` — see there. */
function detectInitialLang(storage: BrowserStorageService, isBrowser: boolean, request: RequestLike): Lang {
  const { lang: stored, explicit } = detectStoredLang(storage, isBrowser, request);
  if (explicit && isSupportedLang(stored)) return stored;

  const countryHint = detectCountryHint(storage, isBrowser, request);
  if (countryHint) return defaultLangForCountry(countryHint);

  // Server side, first-ever visit (no cookies yet): the browser's own Accept-Language header.
  if (!isBrowser) {
    const fromHeader = langFromAcceptLanguage(request?.headers.get('accept-language'));
    if (fromHeader) return fromHeader;
  }

  if (isBrowser && typeof navigator !== 'undefined') {
    const candidates = navigator.languages?.length ? navigator.languages : [navigator.language];
    for (const candidate of candidates) {
      const code = candidate?.slice(0, 2).toLowerCase();
      if (isSupportedLang(code)) return code;
    }
  }
  if (isSupportedLang(stored)) return stored;
  return DEFAULT_LANG;
}

@Injectable({ providedIn: 'root' })
export class I18nService {
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private storage = inject(BrowserStorageService);
  private document = inject(DOCUMENT);
  private request = inject(REQUEST, { optional: true });

  lang = signal<Lang>(detectInitialLang(this.storage, this.isBrowser, this.request));

  /** Dictionaries loaded so far. */
  private dicts = signal<Partial<Record<Lang, Dict>>>({});
  /** The language whose dictionary is on screen: while a newly chosen language is still being fetched, the
   * previous one stays visible (a few hundred ms) instead of showing raw keys. */
  private lastReady = signal<Lang | null>(null);
  private pending = new Map<Lang, Promise<void>>();

  private _dict = computed<Dict>(() => {
    const dicts = this.dicts();
    return dicts[this.lang()] ?? (this.lastReady() ? dicts[this.lastReady()!] : undefined) ?? {};
  });

  /** The language the visible texts are actually in (differs from lang() only while a dictionary loads). */
  readonly activeLang = computed<Lang>(() => (this.dicts()[this.lang()] ? this.lang() : (this.lastReady() ?? this.lang())));

  constructor() {
    // What the visitor chose: remembered right away.
    effect(() => {
      const l = this.lang();
      this.storage.setItem(LANG_KEY, l);
      if (!this.isBrowser) return;
      this.writeCookie(LANG_KEY, l);
    });
    // The page's language and direction follow the texts that are really shown.
    effect(() => {
      const l = this.activeLang();
      this.document.documentElement.lang = l;
      this.document.documentElement.dir = isRtlLang(l) ? 'rtl' : 'ltr';
      if (!this.isBrowser) return;
      const scrollY = window.scrollY;
      requestAnimationFrame(() => window.scrollTo(0, scrollY));
    });
    // Whenever the language changes, make sure its dictionary is (being) loaded.
    effect(() => {
      const l = this.lang();
      untracked(() => { void this.load(l); });
    });
  }

  /** Loads (once) the dictionary of a language. Safe to call repeatedly. */
  load(lang: Lang): Promise<void> {
    if (this.dicts()[lang]) return Promise.resolve();
    let p = this.pending.get(lang);
    if (!p) {
      p = LOADERS[lang]()
        .then(m => {
          this.dicts.update(d => ({ ...d, [lang]: (m.default ?? m) as Dict }));
          this.lastReady.set(lang);
        })
        .catch(() => { /* offline / chunk missing: keep showing the previous language */ })
        .finally(() => this.pending.delete(lang));
      this.pending.set(lang, p);
    }
    return p;
  }

  /** App initializer: waits for the dictionary of the page's language (the URL's language segment, else the detected
   * one) so the very first render — also on the server — already has its texts. */
  async initialLoad(): Promise<void> {
    const path = this.request?.url
      ? (() => { try { return new URL(this.request!.url).pathname; } catch { return this.request!.url; } })()
      : this.document.location?.pathname;
    const lang = langFromPath(path) ?? this.lang();
    await this.load(lang);
    if (!this.dicts()[lang] && lang !== DEFAULT_LANG) await this.load(DEFAULT_LANG); // last resort: English
  }

  /** Mirrors a localStorage write into a cookie so SSR can read it back (see
   * detectStoredLang/detectCountryHint) — same pattern as CountryService's
   * own writeCountryCookie(). */
  private writeCookie(name: string, value: string) {
    if (!this.isBrowser) return;
    this.document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${LANG_COOKIE_MAX_AGE}; samesite=lax`;
  }

  /** Low-level setter — used internally and by LocaleShellComponent to sync
   * the signal to the URL's `:lang` segment on every navigation (including
   * the very first auto-detected redirect). Does NOT mark the language as
   * explicitly chosen; use `chooseLang`/`markLangExplicit` for that. */
  setLang(l: Lang) { this.lang.set(l); }

  /** Set by LocaleShellComponent from the URL's `:lang` segment. Once a page has a language in its URL, that
   * language is final: the later IP-based country guess (setLangFromCountry) must not swap the page's text for
   * another language — visitors, and crawlers rendering /de/... from a US address, would otherwise see a page
   * whose text no longer matches its URL. */
  private urlDriven = false;

  setLangFromUrl(l: Lang) {
    this.urlDriven = true;
    this.lang.set(l);
  }

  /** Marks that the visitor picked a language by hand via the switcher —
   * from now on `detectInitialLang()` always honors the stored value over
   * any country- or browser-based guess, even across reloads and after a
   * country change. Called by the navbar's desktop switcher (which then
   * navigates and lets LocaleShellComponent's `setLang()` follow) and by
   * `chooseLang` below (mobile switcher, which doesn't navigate). */
  markLangExplicit() {
    this.storage.setItem(LANG_EXPLICIT_KEY, '1');
    this.writeCookie(LANG_EXPLICIT_KEY, '1');
  }

  /** Convenience for a switcher that sets the language directly rather than
   * navigating (mobile menu) — marks it explicit and applies it in one call. */
  chooseLang(l: Lang) { this.markLangExplicit(); this.setLang(l); }

  /** Called by CountryService right after its IP-based country detection
   * resolves (client-side, logged-out visitors only) — updates the default
   * language to match the newly-known country, e.g. a first-ever US visitor
   * initially rendered with DEFAULT_LANG gets corrected to English a moment
   * later. A no-op once the visitor has explicitly picked a language. */
  setLangFromCountry(countryCode: string) {
    if (this.urlDriven) return;
    if (this.storage.getItem(LANG_EXPLICIT_KEY) === '1') return;
    const lang = defaultLangForCountry(countryCode);
    if (lang !== this.lang()) this.lang.set(lang);
  }

  /** Prefixes an absolute route-command array with the current language
   * segment, e.g. `this.i18n.withLang(['/annonces', id])` -> `['/fr/annonces', id]`.
   * Use this on every `router.navigate(...)` call site so navigating
   * programmatically stays within the visitor's current language's URL
   * tree — `routerLink` templates get this automatically via
   * LocalizedRouterLinkDirective instead. */
  withLang(commands: ReadonlyArray<unknown>): unknown[] {
    return withLangCommands(commands, this.lang());
  }

  t(key: string, params?: Record<string, string>): string {
    const dict = this._dict();
    const parts = key.split('.');
    let obj: unknown = dict;
    for (const part of parts) {
      if (obj && typeof obj === 'object') obj = (obj as Record<string, unknown>)[part];
      else return key;
    }
    const str = typeof obj === 'string' ? obj : key;
    if (!params) return str;
    return str.replace(/\{(\w+)\}/g, (match, k) => params[k] ?? match);
  }
}
