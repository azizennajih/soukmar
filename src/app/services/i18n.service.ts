import { Injectable, signal, computed, effect, EnvironmentInjector, runInInjectionContext } from '@angular/core';

export type Lang = 'fr' | 'en' | 'ar';

const LANG_KEY = 'soukmar_lang';

// Synchronously bundled translations — no fetch needed, no async delay
import frRaw from '../../assets/i18n/fr.json';
import enRaw from '../../assets/i18n/en.json';
import arRaw from '../../assets/i18n/ar.json';

const TRANSLATIONS: Record<Lang, Record<string, unknown>> = {
  fr: frRaw as Record<string, unknown>,
  en: enRaw as Record<string, unknown>,
  ar: arRaw as Record<string, unknown>,
};

@Injectable({ providedIn: 'root' })
export class I18nService {
  lang = signal<Lang>((localStorage.getItem(LANG_KEY) as Lang) || 'fr');

  private _dict = computed(() => TRANSLATIONS[this.lang()]);

  constructor() {
    effect(() => {
      const l = this.lang();
      localStorage.setItem(LANG_KEY, l);
      document.documentElement.lang = l;
      document.documentElement.dir = l === 'ar' ? 'rtl' : 'ltr';
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
