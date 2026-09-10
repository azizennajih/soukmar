export interface DialCode {
  iso: string;
  name: string;
  dialCode: string;
}

// Morocco first (primary market), then the countries with the largest
// Moroccan diaspora communities and closest neighbors/trading partners —
// not an exhaustive ITU list, kept deliberately short so the dropdown stays
// easy to scan. Flags are rendered separately by app-flag-icon (keyed off
// `iso`), not stored here.
export const DIAL_CODES: DialCode[] = [
  { iso: 'MA', name: 'Maroc', dialCode: '+212' },
  { iso: 'FR', name: 'France', dialCode: '+33' },
  { iso: 'ES', name: 'Espagne', dialCode: '+34' },
  { iso: 'DE', name: 'Allemagne', dialCode: '+49' },
  { iso: 'IT', name: 'Italie', dialCode: '+39' },
  { iso: 'BE', name: 'Belgique', dialCode: '+32' },
  { iso: 'NL', name: 'Pays-Bas', dialCode: '+31' },
  { iso: 'GB', name: 'Royaume-Uni', dialCode: '+44' },
  { iso: 'CH', name: 'Suisse', dialCode: '+41' },
  { iso: 'PT', name: 'Portugal', dialCode: '+351' },
  { iso: 'SE', name: 'Suède', dialCode: '+46' },
  { iso: 'US', name: 'États-Unis', dialCode: '+1' },
  { iso: 'CA', name: 'Canada', dialCode: '+1' },
  { iso: 'DZ', name: 'Algérie', dialCode: '+213' },
  { iso: 'TN', name: 'Tunisie', dialCode: '+216' },
  { iso: 'TR', name: 'Turquie', dialCode: '+90' },
  { iso: 'AE', name: 'Émirats arabes unis', dialCode: '+971' },
  { iso: 'SA', name: 'Arabie saoudite', dialCode: '+966' },
];

// Same simplification already used for MOROCCO_CITIES_AR in listing.model.ts:
// only Arabic gets a dedicated translation; the other 5 UI languages fall
// back to the French name stored above.
const DIAL_CODES_AR: Record<string, string> = {
  MA: 'المغرب',
  FR: 'فرنسا',
  ES: 'إسبانيا',
  DE: 'ألمانيا',
  IT: 'إيطاليا',
  BE: 'بلجيكا',
  NL: 'هولندا',
  GB: 'المملكة المتحدة',
  CH: 'سويسرا',
  PT: 'البرتغال',
  SE: 'السويد',
  US: 'الولايات المتحدة',
  CA: 'كندا',
  DZ: 'الجزائر',
  TN: 'تونس',
  TR: 'تركيا',
  AE: 'الإمارات العربية المتحدة',
  SA: 'المملكة العربية السعودية',
};

const DEFAULT_ISO = 'MA';

export function dialCodeByIso(iso: string): DialCode {
  return DIAL_CODES.find(d => d.iso === iso) ?? DIAL_CODES[0]!;
}

export function dialCodeLabel(iso: string, lang: string): string {
  const entry = dialCodeByIso(iso);
  return lang === 'ar' ? (DIAL_CODES_AR[entry.iso] ?? entry.name) : entry.name;
}

/** Splits a stored phone string into { iso, localNumber }, matching the
 * longest known dial code prefix (longest first, since e.g. "+21" is a
 * prefix of both Algeria's "+213" and Tunisia's "+216"). Falls back to
 * Morocco with the whole string treated as the local number when nothing
 * matches — covers empty values and legacy numbers saved without a "+"
 * before this feature existed. */
export function parsePhone(phone: string | null | undefined): { iso: string; localNumber: string } {
  const trimmed = (phone ?? '').trim();
  if (trimmed.startsWith('+')) {
    const byLongestCode = [...DIAL_CODES].sort((a, b) => b.dialCode.length - a.dialCode.length);
    for (const candidate of byLongestCode) {
      if (trimmed.startsWith(candidate.dialCode)) {
        return { iso: candidate.iso, localNumber: trimmed.slice(candidate.dialCode.length).trim() };
      }
    }
  }
  return { iso: DEFAULT_ISO, localNumber: trimmed };
}

/** Composes { iso, localNumber } back into a single dial-code-prefixed
 * string for storage — strips a leading national trunk "0" (so "06 12 34 56 78"
 * becomes "+212612345678", not "+2120612345678") and any non-digit
 * characters from the local part. */
export function composePhone(iso: string, localNumber: string): string {
  const digits = localNumber.replace(/\D/g, '').replace(/^0+/, '');
  if (!digits) return '';
  return `${dialCodeByIso(iso).dialCode}${digits}`;
}
