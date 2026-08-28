import { Injectable, signal, effect } from '@angular/core';

export type Lang = 'fr' | 'en' | 'ar';

const LANG_KEY = 'soukmar_lang';

@Injectable({ providedIn: 'root' })
export class I18nService {
  lang = signal<Lang>((localStorage.getItem(LANG_KEY) as Lang) || 'fr');
  private translations: Record<string, unknown> = {};
  private loaded = false;

  constructor() {
    effect(() => {
      const l = this.lang();
      localStorage.setItem(LANG_KEY, l);
      document.documentElement.lang = l;
      document.documentElement.dir = l === 'ar' ? 'rtl' : 'ltr';
      this.loadLang(l);
    });
  }

  setLang(l: Lang) { this.lang.set(l); }

  t(key: string): string {
    const parts = key.split('.');
    let obj: unknown = this.translations;
    for (const part of parts) {
      if (obj && typeof obj === 'object') obj = (obj as Record<string, unknown>)[part];
      else return key;
    }
    return typeof obj === 'string' ? obj : key;
  }

  private async loadLang(l: Lang) {
    try {
      const res = await fetch(`/assets/i18n/${l}.json`);
      this.translations = await res.json();
      this.loaded = true;
      // Trigger change detection by updating a signal
      this._tick.set(this._tick() + 1);
    } catch { console.error(`Failed to load lang: ${l}`); }
  }

  _tick = signal(0);
}
