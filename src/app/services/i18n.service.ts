import { Injectable, signal, computed, effect, inject, PLATFORM_ID } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { BrowserStorageService } from './browser-storage.service';
import { DEFAULT_LANG, isSupportedLang, withLang as withLangCommands, type Lang } from './locale-routing';

export type { Lang };

const LANG_KEY = 'soukmar_lang';

import frRaw from '../../assets/i18n/fr.json';
import enRaw from '../../assets/i18n/en.json';
import arRaw from '../../assets/i18n/ar.json';
import deRaw from '../../assets/i18n/de.json';
import esRaw from '../../assets/i18n/es.json';
import itRaw from '../../assets/i18n/it.json';

const TRANSLATIONS: Record<Lang, Record<string, unknown>> = {
  fr: frRaw as Record<string, unknown>,
  en: enRaw as Record<string, unknown>,
  ar: arRaw as Record<string, unknown>,
  de: deRaw as Record<string, unknown>,
  es: esRaw as Record<string, unknown>,
  it: itRaw as Record<string, unknown>,
};

/** localStorage (an explicit earlier choice) wins; failing that, on the
 * browser only, a supported language among `navigator.languages` is used
 * so a first-time Arabic- or Spanish-speaking visitor doesn't land in
 * French by default. The server has no request-language signal wired up
 * (see app.routes.ts's bare-URL redirect), so it always falls back to
 * DEFAULT_LANG — deterministic and matching the `x-default` hreflang. */
function detectInitialLang(storage: BrowserStorageService, isBrowser: boolean): Lang {
  const stored = storage.getItem(LANG_KEY);
  if (isSupportedLang(stored)) return stored;
  if (isBrowser && typeof navigator !== 'undefined') {
    const candidates = navigator.languages?.length ? navigator.languages : [navigator.language];
    for (const candidate of candidates) {
      const code = candidate?.slice(0, 2).toLowerCase();
      if (isSupportedLang(code)) return code;
    }
  }
  return DEFAULT_LANG;
}

@Injectable({ providedIn: 'root' })
export class I18nService {
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private storage = inject(BrowserStorageService);
  private document = inject(DOCUMENT);

  lang = signal<Lang>(detectInitialLang(this.storage, this.isBrowser));

  private _dict = computed(() => TRANSLATIONS[this.lang()]);

  constructor() {
    effect(() => {
      const l = this.lang();
      this.storage.setItem(LANG_KEY, l);
      this.document.documentElement.lang = l;
      this.document.documentElement.dir = l === 'ar' ? 'rtl' : 'ltr';
      if (!this.isBrowser) return;
      const scrollY = window.scrollY;
      requestAnimationFrame(() => window.scrollTo(0, scrollY));
    });
  }

  setLang(l: Lang) { this.lang.set(l); }

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
