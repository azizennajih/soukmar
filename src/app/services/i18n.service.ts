import { Injectable, signal, computed, effect } from '@angular/core';

export type Lang = 'fr' | 'en' | 'ar' | 'de' | 'es' | 'it';

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

const VALID_LANGS: Lang[] = ['fr', 'en', 'ar', 'de', 'es', 'it'];

@Injectable({ providedIn: 'root' })
export class I18nService {
  lang = signal<Lang>(
    (VALID_LANGS.includes(localStorage.getItem(LANG_KEY) as Lang)
      ? localStorage.getItem(LANG_KEY) as Lang
      : 'fr')
  );

  private _dict = computed(() => TRANSLATIONS[this.lang()]);

  constructor() {
    effect(() => {
      const l = this.lang();
      localStorage.setItem(LANG_KEY, l);
      document.documentElement.lang = l;
      const scrollY = window.scrollY;
      document.documentElement.dir = l === 'ar' ? 'rtl' : 'ltr';
      requestAnimationFrame(() => window.scrollTo(0, scrollY));
    });
  }

  setLang(l: Lang) { this.lang.set(l); }

  t(key: string): string {
    const dict = this._dict();
    const parts = key.split('.');
    let obj: unknown = dict;
    for (const part of parts) {
      if (obj && typeof obj === 'object') obj = (obj as Record<string, unknown>)[part];
      else return key;
    }
    return typeof obj === 'string' ? obj : key;
  }
}
