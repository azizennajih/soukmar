import { describe, it, expect } from 'vitest';
import { decideSeo } from './seo-rules';
import { INDEXABLE_LANGS, SUPPORTED_LANGS, isIndexableLang } from './locale-routing';

describe('indexable languages', () => {
  it('are real supported languages and a deliberate subset', () => {
    for (const l of INDEXABLE_LANGS) expect(SUPPORTED_LANGS).toContain(l);
    expect(isIndexableLang('de')).toBe(true);
    expect(isIndexableLang('fa')).toBe(false);
  });
});

describe('decideSeo', () => {
  it('indexes a normal page with a self canonical and hreflang for every indexable language', () => {
    const d = decideSeo('/de/a-propos');
    expect(d.canonical).toBe('https://souqmar24.com/de/a-propos');
    expect(d.robots).toContain('index');
    expect(d.robots).not.toContain('noindex');
    expect(d.hreflang.map(h => h.lang)).toEqual([...INDEXABLE_LANGS, 'x-default']);
    expect(d.hreflang.find(h => h.lang === 'ar')!.href).toBe('https://souqmar24.com/ar/a-propos');
    expect(d.hreflang.find(h => h.lang === 'x-default')!.href).toBe('https://souqmar24.com/fr/a-propos');
  });

  it('treats the language root as the home page', () => {
    expect(decideSeo('/en').canonical).toBe('https://souqmar24.com/en');
    expect(decideSeo('/en/').canonical).toBe('https://souqmar24.com/en');
    expect(decideSeo('/en').hreflang.find(h => h.lang === 'fr')!.href).toBe('https://souqmar24.com/fr');
  });

  it('drops tracking parameters from the canonical URL', () => {
    expect(decideSeo('/de/a-propos?utm_source=x&fbclid=1').canonical).toBe('https://souqmar24.com/de/a-propos');
    expect(decideSeo('/de/a-propos?utm_source=x').robots).toContain('index, follow');
  });

  it('keeps ?categorie= as its own indexable landing page', () => {
    const d = decideSeo('/es/annonces?categorie=VEHICLES');
    expect(d.canonical).toBe('https://souqmar24.com/es/annonces?categorie=VEHICLES');
    expect(d.robots).toContain('index, follow');
    expect(d.hreflang.find(h => h.lang === 'it')!.href).toBe('https://souqmar24.com/it/annonces?categorie=VEHICLES');
  });

  it('keeps filter and sort variants of the listings page out of the index', () => {
    const d = decideSeo('/de/annonces?categorie=VEHICLES&tri=prix&page=3');
    expect(d.canonical).toBe('https://souqmar24.com/de/annonces?categorie=VEHICLES');
    expect(d.robots).toBe('noindex, follow');
    expect(d.hreflang).toEqual([]);
    expect(decideSeo('/de/annonces?q=iphone').canonical).toBe('https://souqmar24.com/de/annonces');
    expect(decideSeo('/de/annonces?q=iphone').robots).toBe('noindex, follow');
  });

  it('keeps languages without reviewed translations out of the index and the hreflang cluster', () => {
    const d = decideSeo('/ur/annonces');
    expect(d.canonical).toBe('https://souqmar24.com/ur/annonces');
    expect(d.robots).toBe('noindex, follow');
    expect(d.hreflang).toEqual([]);
  });

  it('never indexes or follows private pages', () => {
    expect(decideSeo('/de/mes-annonces', 'private').robots).toBe('noindex, nofollow');
    expect(decideSeo('/de/auth/login', 'private').hreflang).toEqual([]);
    expect(decideSeo('/de/vendeur/abc', 'noindex').robots).toBe('noindex, follow');
  });

  it('gives URLs without a language prefix no canonical (they only redirect)', () => {
    expect(decideSeo('/annonces/abc').canonical).toBeNull();
    expect(decideSeo('/').canonical).toBeNull();
    expect(decideSeo('/xx/annonces').canonical).toBeNull();
  });
});
