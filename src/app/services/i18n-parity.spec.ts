import ar from '../../assets/i18n/ar.json';
import de from '../../assets/i18n/de.json';
import en from '../../assets/i18n/en.json';
import es from '../../assets/i18n/es.json';
import fr from '../../assets/i18n/fr.json';
import itLocale from '../../assets/i18n/it.json';

// This test exists because of a real incident: dozens of UI strings across
// the app were hardcoded in French and silently ignored the active
// language — a user with German/English/etc. selected still saw French
// text. Every fix added the missing key to all 6 locale files by hand. This
// test catches the next time a key gets added to one file and forgotten in
// the others, without needing to manually re-audit the whole app again.

const DICTS: Record<string, Record<string, unknown>> = { ar, de, en, es, fr, it: itLocale };
const LANGS = Object.keys(DICTS);

/** Flattens a nested translation object into dotted keys, e.g.
 * { auth: { login_btn: '...' } } -> ['auth.login_btn']. */
function flattenKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return flattenKeys(value as Record<string, unknown>, path);
    }
    return [path];
  });
}

describe('i18n locale files', () => {
  const keysByLang = new Map(LANGS.map(lang => [lang, new Set(flattenKeys(DICTS[lang]))]));

  it('every locale file is non-empty', () => {
    for (const lang of LANGS) {
      expect(Object.keys(DICTS[lang]).length).toBeGreaterThan(0);
    }
  });

  it.each(LANGS.filter(l => l !== 'fr'))('%s has every key that fr.json has (no missing translations)', (lang) => {
    const frKeys = keysByLang.get('fr')!;
    const langKeys = keysByLang.get(lang)!;
    const missing = [...frKeys].filter(k => !langKeys.has(k));
    expect(missing, `${lang}.json is missing keys present in fr.json`).toEqual([]);
  });

  it.each(LANGS.filter(l => l !== 'fr'))('%s has no extra keys beyond fr.json (no orphaned translations)', (lang) => {
    const frKeys = keysByLang.get('fr')!;
    const langKeys = keysByLang.get(lang)!;
    const extra = [...langKeys].filter(k => !frKeys.has(k));
    expect(extra, `${lang}.json has keys not present in fr.json`).toEqual([]);
  });

  it('no locale file has an empty string as a translation value', () => {
    for (const lang of LANGS) {
      const dict = DICTS[lang];
      const empties = flattenKeys(dict).filter(key => {
        const value = key.split('.').reduce<unknown>((o, k) => (o as Record<string, unknown>)?.[k], dict);
        return value === '';
      });
      expect(empties, `${lang}.json has empty-string values for these keys`).toEqual([]);
    }
  });
});
