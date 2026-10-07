import { langFromAcceptLanguage } from './locale-routing';

describe('langFromAcceptLanguage', () => {
  it('picks the first supported language of a typical browser header', () => {
    expect(langFromAcceptLanguage('de-DE,de;q=0.9,en;q=0.8')).toBe('de');
    expect(langFromAcceptLanguage('ar-MA,ar;q=0.9,fr;q=0.8')).toBe('ar');
    expect(langFromAcceptLanguage('fr-MA,fr;q=0.9')).toBe('fr');
  });

  it('honours q-values over the order in the header', () => {
    expect(langFromAcceptLanguage('en;q=0.5,de;q=0.9')).toBe('de');
  });

  it('skips unsupported languages and q=0 entries', () => {
    expect(langFromAcceptLanguage('ja,zh;q=0.9,es;q=0.5')).toBe('es');
    expect(langFromAcceptLanguage('de;q=0,en')).toBe('en');
  });

  it('returns null for missing, empty or unsupported-only headers', () => {
    expect(langFromAcceptLanguage(null)).toBeNull();
    expect(langFromAcceptLanguage('')).toBeNull();
    expect(langFromAcceptLanguage('ja,zh')).toBeNull();
    expect(langFromAcceptLanguage('*')).toBeNull();
  });
});
