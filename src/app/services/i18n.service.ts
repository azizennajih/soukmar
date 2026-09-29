import { Injectable, signal, computed, effect, inject, PLATFORM_ID, REQUEST } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { BrowserStorageService } from './browser-storage.service';
import { DEFAULT_LANG, isSupportedLang, isRtlLang, withLang as withLangCommands, type Lang } from './locale-routing';
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

import frRaw from '../../assets/i18n/fr.json';
import enRaw from '../../assets/i18n/en.json';
import arRaw from '../../assets/i18n/ar.json';
import deRaw from '../../assets/i18n/de.json';
import esRaw from '../../assets/i18n/es.json';
import itRaw from '../../assets/i18n/it.json';
import ptRaw from '../../assets/i18n/pt.json';
import trRaw from '../../assets/i18n/tr.json';
import faRaw from '../../assets/i18n/fa.json';
import urRaw from '../../assets/i18n/ur.json';
import psRaw from '../../assets/i18n/ps.json';

const TRANSLATIONS: Record<Lang, Record<string, unknown>> = {
  fr: frRaw as Record<string, unknown>,
  en: enRaw as Record<string, unknown>,
  ar: arRaw as Record<string, unknown>,
  de: deRaw as Record<string, unknown>,
  es: esRaw as Record<string, unknown>,
  it: itRaw as Record<string, unknown>,
  pt: ptRaw as Record<string, unknown>,
  tr: trRaw as Record<string, unknown>,
  fa: faRaw as Record<string, unknown>,
  ur: urRaw as Record<string, unknown>,
  ps: psRaw as Record<string, unknown>,
};

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

  private _dict = computed(() => TRANSLATIONS[this.lang()]);

  constructor() {
    effect(() => {
      const l = this.lang();
      this.storage.setItem(LANG_KEY, l);
      this.document.documentElement.lang = l;
      this.document.documentElement.dir = isRtlLang(l) ? 'rtl' : 'ltr';
      if (!this.isBrowser) return;
      this.writeCookie(LANG_KEY, l);
      const scrollY = window.scrollY;
      requestAnimationFrame(() => window.scrollTo(0, scrollY));
    });
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
