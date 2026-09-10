export interface DialCode {
  iso: string;
  name: string;
  dialCode: string;
  /** Marks the preferred country for a dial code shared by several
   * countries (NANP "+1", or "+7" for Russia/Kazakhstan) — parsePhone()
   * uses this to pick a sensible one when reconstructing a country from a
   * stored number, since digits alone can't otherwise distinguish them
   * without a full area-code table. */
  primary?: boolean;
}

// All 193 UN member states plus Vatican City, Palestine, Taiwan, Hong Kong,
// Macau and Kosovo (non/partially-recognized but each with its own dial
// code and in everyday use) — Morocco pinned first as the primary market,
// the rest alphabetical by French name. Flags are rendered separately by
// app-flag-icon (the `flag-icons` package, keyed off `iso`), not stored here.
export const DIAL_CODES: DialCode[] = [
  { iso: 'MA', name: 'Maroc', dialCode: '+212' },
  { iso: 'ZA', name: 'Afrique du Sud', dialCode: '+27' },
  { iso: 'AL', name: 'Albanie', dialCode: '+355' },
  { iso: 'DZ', name: 'Algérie', dialCode: '+213' },
  { iso: 'DE', name: 'Allemagne', dialCode: '+49' },
  { iso: 'AD', name: 'Andorre', dialCode: '+376' },
  { iso: 'AO', name: 'Angola', dialCode: '+244' },
  { iso: 'AG', name: 'Antigua-et-Barbuda', dialCode: '+1' },
  { iso: 'SA', name: 'Arabie saoudite', dialCode: '+966' },
  { iso: 'AR', name: 'Argentine', dialCode: '+54' },
  { iso: 'AM', name: 'Arménie', dialCode: '+374' },
  { iso: 'AU', name: 'Australie', dialCode: '+61' },
  { iso: 'AT', name: 'Autriche', dialCode: '+43' },
  { iso: 'AZ', name: 'Azerbaïdjan', dialCode: '+994' },
  { iso: 'BS', name: 'Bahamas', dialCode: '+1' },
  { iso: 'BH', name: 'Bahreïn', dialCode: '+973' },
  { iso: 'BD', name: 'Bangladesh', dialCode: '+880' },
  { iso: 'BB', name: 'Barbade', dialCode: '+1' },
  { iso: 'BE', name: 'Belgique', dialCode: '+32' },
  { iso: 'BZ', name: 'Belize', dialCode: '+501' },
  { iso: 'BJ', name: 'Bénin', dialCode: '+229' },
  { iso: 'BT', name: 'Bhoutan', dialCode: '+975' },
  { iso: 'BY', name: 'Biélorussie', dialCode: '+375' },
  { iso: 'MM', name: 'Birmanie', dialCode: '+95' },
  { iso: 'BO', name: 'Bolivie', dialCode: '+591' },
  { iso: 'BA', name: 'Bosnie-Herzégovine', dialCode: '+387' },
  { iso: 'BW', name: 'Botswana', dialCode: '+267' },
  { iso: 'BR', name: 'Brésil', dialCode: '+55' },
  { iso: 'BN', name: 'Brunei', dialCode: '+673' },
  { iso: 'BG', name: 'Bulgarie', dialCode: '+359' },
  { iso: 'BF', name: 'Burkina Faso', dialCode: '+226' },
  { iso: 'BI', name: 'Burundi', dialCode: '+257' },
  { iso: 'KH', name: 'Cambodge', dialCode: '+855' },
  { iso: 'CM', name: 'Cameroun', dialCode: '+237' },
  { iso: 'CA', name: 'Canada', dialCode: '+1' },
  { iso: 'CV', name: 'Cap-Vert', dialCode: '+238' },
  { iso: 'CF', name: 'République centrafricaine', dialCode: '+236' },
  { iso: 'CL', name: 'Chili', dialCode: '+56' },
  { iso: 'CN', name: 'Chine', dialCode: '+86' },
  { iso: 'CY', name: 'Chypre', dialCode: '+357' },
  { iso: 'CO', name: 'Colombie', dialCode: '+57' },
  { iso: 'KM', name: 'Comores', dialCode: '+269' },
  { iso: 'CG', name: 'Congo-Brazzaville', dialCode: '+242' },
  { iso: 'CD', name: 'Congo-Kinshasa', dialCode: '+243' },
  { iso: 'KR', name: 'Corée du Sud', dialCode: '+82' },
  { iso: 'KP', name: 'Corée du Nord', dialCode: '+850' },
  { iso: 'CR', name: 'Costa Rica', dialCode: '+506' },
  { iso: 'CI', name: "Côte d'Ivoire", dialCode: '+225' },
  { iso: 'HR', name: 'Croatie', dialCode: '+385' },
  { iso: 'CU', name: 'Cuba', dialCode: '+53' },
  { iso: 'DK', name: 'Danemark', dialCode: '+45' },
  { iso: 'DJ', name: 'Djibouti', dialCode: '+253' },
  { iso: 'DM', name: 'Dominique', dialCode: '+1' },
  { iso: 'EG', name: 'Égypte', dialCode: '+20' },
  { iso: 'AE', name: 'Émirats arabes unis', dialCode: '+971' },
  { iso: 'EC', name: 'Équateur', dialCode: '+593' },
  { iso: 'ER', name: 'Érythrée', dialCode: '+291' },
  { iso: 'ES', name: 'Espagne', dialCode: '+34' },
  { iso: 'EE', name: 'Estonie', dialCode: '+372' },
  { iso: 'SZ', name: 'Eswatini', dialCode: '+268' },
  { iso: 'US', name: 'États-Unis', dialCode: '+1', primary: true },
  { iso: 'ET', name: 'Éthiopie', dialCode: '+251' },
  { iso: 'FJ', name: 'Fidji', dialCode: '+679' },
  { iso: 'FI', name: 'Finlande', dialCode: '+358' },
  { iso: 'FR', name: 'France', dialCode: '+33' },
  { iso: 'GA', name: 'Gabon', dialCode: '+241' },
  { iso: 'GM', name: 'Gambie', dialCode: '+220' },
  { iso: 'GE', name: 'Géorgie', dialCode: '+995' },
  { iso: 'GH', name: 'Ghana', dialCode: '+233' },
  { iso: 'GR', name: 'Grèce', dialCode: '+30' },
  { iso: 'GD', name: 'Grenade', dialCode: '+1' },
  { iso: 'GT', name: 'Guatemala', dialCode: '+502' },
  { iso: 'GN', name: 'Guinée', dialCode: '+224' },
  { iso: 'GQ', name: 'Guinée équatoriale', dialCode: '+240' },
  { iso: 'GW', name: 'Guinée-Bissau', dialCode: '+245' },
  { iso: 'GY', name: 'Guyana', dialCode: '+592' },
  { iso: 'HT', name: 'Haïti', dialCode: '+509' },
  { iso: 'HN', name: 'Honduras', dialCode: '+504' },
  { iso: 'HK', name: 'Hong Kong', dialCode: '+852' },
  { iso: 'HU', name: 'Hongrie', dialCode: '+36' },
  { iso: 'IN', name: 'Inde', dialCode: '+91' },
  { iso: 'ID', name: 'Indonésie', dialCode: '+62' },
  { iso: 'IQ', name: 'Irak', dialCode: '+964' },
  { iso: 'IR', name: 'Iran', dialCode: '+98' },
  { iso: 'IE', name: 'Irlande', dialCode: '+353' },
  { iso: 'IS', name: 'Islande', dialCode: '+354' },
  { iso: 'IL', name: 'Israël', dialCode: '+972' },
  { iso: 'IT', name: 'Italie', dialCode: '+39' },
  { iso: 'JM', name: 'Jamaïque', dialCode: '+1' },
  { iso: 'JP', name: 'Japon', dialCode: '+81' },
  { iso: 'JO', name: 'Jordanie', dialCode: '+962' },
  { iso: 'KZ', name: 'Kazakhstan', dialCode: '+7', primary: true },
  { iso: 'KE', name: 'Kenya', dialCode: '+254' },
  { iso: 'KG', name: 'Kirghizistan', dialCode: '+996' },
  { iso: 'KI', name: 'Kiribati', dialCode: '+686' },
  { iso: 'XK', name: 'Kosovo', dialCode: '+383' },
  { iso: 'KW', name: 'Koweït', dialCode: '+965' },
  { iso: 'LA', name: 'Laos', dialCode: '+856' },
  { iso: 'LS', name: 'Lesotho', dialCode: '+266' },
  { iso: 'LV', name: 'Lettonie', dialCode: '+371' },
  { iso: 'LB', name: 'Liban', dialCode: '+961' },
  { iso: 'LR', name: 'Liberia', dialCode: '+231' },
  { iso: 'LY', name: 'Libye', dialCode: '+218' },
  { iso: 'LI', name: 'Liechtenstein', dialCode: '+423' },
  { iso: 'LT', name: 'Lituanie', dialCode: '+370' },
  { iso: 'LU', name: 'Luxembourg', dialCode: '+352' },
  { iso: 'MO', name: 'Macao', dialCode: '+853' },
  { iso: 'MK', name: 'Macédoine du Nord', dialCode: '+389' },
  { iso: 'MG', name: 'Madagascar', dialCode: '+261' },
  { iso: 'MY', name: 'Malaisie', dialCode: '+60' },
  { iso: 'MW', name: 'Malawi', dialCode: '+265' },
  { iso: 'MV', name: 'Maldives', dialCode: '+960' },
  { iso: 'ML', name: 'Mali', dialCode: '+223' },
  { iso: 'MT', name: 'Malte', dialCode: '+356' },
  { iso: 'MU', name: 'Maurice', dialCode: '+230' },
  { iso: 'MR', name: 'Mauritanie', dialCode: '+222' },
  { iso: 'MX', name: 'Mexique', dialCode: '+52' },
  { iso: 'FM', name: 'Micronésie', dialCode: '+691' },
  { iso: 'MD', name: 'Moldavie', dialCode: '+373' },
  { iso: 'MC', name: 'Monaco', dialCode: '+377' },
  { iso: 'MN', name: 'Mongolie', dialCode: '+976' },
  { iso: 'ME', name: 'Monténégro', dialCode: '+382' },
  { iso: 'MZ', name: 'Mozambique', dialCode: '+258' },
  { iso: 'NA', name: 'Namibie', dialCode: '+264' },
  { iso: 'NR', name: 'Nauru', dialCode: '+674' },
  { iso: 'NP', name: 'Népal', dialCode: '+977' },
  { iso: 'NI', name: 'Nicaragua', dialCode: '+505' },
  { iso: 'NE', name: 'Niger', dialCode: '+227' },
  { iso: 'NG', name: 'Nigeria', dialCode: '+234' },
  { iso: 'NO', name: 'Norvège', dialCode: '+47' },
  { iso: 'NZ', name: 'Nouvelle-Zélande', dialCode: '+64' },
  { iso: 'OM', name: 'Oman', dialCode: '+968' },
  { iso: 'UG', name: 'Ouganda', dialCode: '+256' },
  { iso: 'UZ', name: 'Ouzbékistan', dialCode: '+998' },
  { iso: 'PK', name: 'Pakistan', dialCode: '+92' },
  { iso: 'PW', name: 'Palaos', dialCode: '+680' },
  { iso: 'PS', name: 'Palestine', dialCode: '+970' },
  { iso: 'PA', name: 'Panama', dialCode: '+507' },
  { iso: 'PG', name: 'Papouasie-Nouvelle-Guinée', dialCode: '+675' },
  { iso: 'PY', name: 'Paraguay', dialCode: '+595' },
  { iso: 'NL', name: 'Pays-Bas', dialCode: '+31' },
  { iso: 'PE', name: 'Pérou', dialCode: '+51' },
  { iso: 'PH', name: 'Philippines', dialCode: '+63' },
  { iso: 'PL', name: 'Pologne', dialCode: '+48' },
  { iso: 'PT', name: 'Portugal', dialCode: '+351' },
  { iso: 'QA', name: 'Qatar', dialCode: '+974' },
  { iso: 'RO', name: 'Roumanie', dialCode: '+40' },
  { iso: 'GB', name: 'Royaume-Uni', dialCode: '+44' },
  { iso: 'RU', name: 'Russie', dialCode: '+7', primary: true },
  { iso: 'RW', name: 'Rwanda', dialCode: '+250' },
  { iso: 'KN', name: 'Saint-Christophe-et-Niévès', dialCode: '+1' },
  { iso: 'SM', name: 'Saint-Marin', dialCode: '+378' },
  { iso: 'VC', name: 'Saint-Vincent-et-les-Grenadines', dialCode: '+1' },
  { iso: 'LC', name: 'Sainte-Lucie', dialCode: '+1' },
  { iso: 'SB', name: 'Salomon (Îles)', dialCode: '+677' },
  { iso: 'SV', name: 'Salvador', dialCode: '+503' },
  { iso: 'WS', name: 'Samoa', dialCode: '+685' },
  { iso: 'ST', name: 'Sao Tomé-et-Principe', dialCode: '+239' },
  { iso: 'SN', name: 'Sénégal', dialCode: '+221' },
  { iso: 'RS', name: 'Serbie', dialCode: '+381' },
  { iso: 'SC', name: 'Seychelles', dialCode: '+248' },
  { iso: 'SL', name: 'Sierra Leone', dialCode: '+232' },
  { iso: 'SG', name: 'Singapour', dialCode: '+65' },
  { iso: 'SK', name: 'Slovaquie', dialCode: '+421' },
  { iso: 'SI', name: 'Slovénie', dialCode: '+386' },
  { iso: 'SO', name: 'Somalie', dialCode: '+252' },
  { iso: 'SD', name: 'Soudan', dialCode: '+249' },
  { iso: 'SS', name: 'Soudan du Sud', dialCode: '+211' },
  { iso: 'LK', name: 'Sri Lanka', dialCode: '+94' },
  { iso: 'SE', name: 'Suède', dialCode: '+46' },
  { iso: 'CH', name: 'Suisse', dialCode: '+41' },
  { iso: 'SR', name: 'Suriname', dialCode: '+597' },
  { iso: 'SY', name: 'Syrie', dialCode: '+963' },
  { iso: 'TJ', name: 'Tadjikistan', dialCode: '+992' },
  { iso: 'TW', name: 'Taïwan', dialCode: '+886' },
  { iso: 'TZ', name: 'Tanzanie', dialCode: '+255' },
  { iso: 'TD', name: 'Tchad', dialCode: '+235' },
  { iso: 'CZ', name: 'Tchéquie', dialCode: '+420' },
  { iso: 'TH', name: 'Thaïlande', dialCode: '+66' },
  { iso: 'TL', name: 'Timor oriental', dialCode: '+670' },
  { iso: 'TG', name: 'Togo', dialCode: '+228' },
  { iso: 'TO', name: 'Tonga', dialCode: '+676' },
  { iso: 'TT', name: 'Trinité-et-Tobago', dialCode: '+1' },
  { iso: 'TN', name: 'Tunisie', dialCode: '+216' },
  { iso: 'TM', name: 'Turkménistan', dialCode: '+993' },
  { iso: 'TR', name: 'Turquie', dialCode: '+90' },
  { iso: 'TV', name: 'Tuvalu', dialCode: '+688' },
  { iso: 'UA', name: 'Ukraine', dialCode: '+380' },
  { iso: 'UY', name: 'Uruguay', dialCode: '+598' },
  { iso: 'VU', name: 'Vanuatu', dialCode: '+678' },
  { iso: 'VA', name: 'Vatican', dialCode: '+379' },
  { iso: 'VE', name: 'Venezuela', dialCode: '+58' },
  { iso: 'VN', name: 'Vietnam', dialCode: '+84' },
  { iso: 'YE', name: 'Yémen', dialCode: '+967' },
  { iso: 'ZM', name: 'Zambie', dialCode: '+260' },
  { iso: 'ZW', name: 'Zimbabwe', dialCode: '+263' },
];

// Same simplification already used for MOROCCO_CITIES_AR in listing.model.ts:
// only Arabic gets a dedicated translation; the other 5 UI languages fall
// back to the French name stored above. Covers every entry above.
const DIAL_CODES_AR: Record<string, string> = {
  MA: 'المغرب', ZA: 'جنوب أفريقيا', AL: 'ألبانيا', DZ: 'الجزائر', DE: 'ألمانيا',
  AD: 'أندورا', AO: 'أنغولا', AG: 'أنتيغوا وبربودا', SA: 'المملكة العربية السعودية',
  AR: 'الأرجنتين', AM: 'أرمينيا', AU: 'أستراليا', AT: 'النمسا', AZ: 'أذربيجان',
  BS: 'باهاماس', BH: 'البحرين', BD: 'بنغلاديش', BB: 'بربادوس', BE: 'بلجيكا',
  BZ: 'بليز', BJ: 'بنين', BT: 'بوتان', BY: 'بيلاروسيا', MM: 'ميانمار',
  BO: 'بوليفيا', BA: 'البوسنة والهرسك', BW: 'بوتسوانا', BR: 'البرازيل',
  BN: 'بروناي', BG: 'بلغاريا', BF: 'بوركينا فاسو', BI: 'بوروندي',
  KH: 'كمبوديا', CM: 'الكاميرون', CA: 'كندا', CV: 'الرأس الأخضر',
  CF: 'أفريقيا الوسطى', CL: 'تشيلي', CN: 'الصين', CY: 'قبرص', CO: 'كولومبيا',
  KM: 'جزر القمر', CG: 'الكونغو برازافيل', CD: 'الكونغو الديمقراطية',
  KR: 'كوريا الجنوبية', KP: 'كوريا الشمالية', CR: 'كوستاريكا',
  CI: 'ساحل العاج', HR: 'كرواتيا', CU: 'كوبا', DK: 'الدنمارك', DJ: 'جيبوتي',
  DM: 'دومينيكا', EG: 'مصر', AE: 'الإمارات العربية المتحدة', EC: 'الإكوادور',
  ER: 'إريتريا', ES: 'إسبانيا', EE: 'إستونيا', SZ: 'إسواتيني',
  US: 'الولايات المتحدة', ET: 'إثيوبيا', FJ: 'فيجي', FI: 'فنلندا',
  FR: 'فرنسا', GA: 'الغابون', GM: 'غامبيا', GE: 'جورجيا', GH: 'غانا',
  GR: 'اليونان', GD: 'غرينادا', GT: 'غواتيمالا', GN: 'غينيا',
  GQ: 'غينيا الاستوائية', GW: 'غينيا بيساو', GY: 'غيانا', HT: 'هايتي',
  HN: 'هندوراس', HK: 'هونغ كونغ', HU: 'المجر', IN: 'الهند', ID: 'إندونيسيا',
  IQ: 'العراق', IR: 'إيران', IE: 'أيرلندا', IS: 'آيسلندا', IL: 'إسرائيل',
  IT: 'إيطاليا', JM: 'جامايكا', JP: 'اليابان', JO: 'الأردن',
  KZ: 'كازاخستان', KE: 'كينيا', KG: 'قيرغيزستان', KI: 'كيريباتي',
  XK: 'كوسوفو', KW: 'الكويت', LA: 'لاوس', LS: 'ليسوتو', LV: 'لاتفيا',
  LB: 'لبنان', LR: 'ليبيريا', LY: 'ليبيا', LI: 'ليختنشتاين',
  LT: 'ليتوانيا', LU: 'لوكسمبورغ', MO: 'ماكاو', MK: 'مقدونيا الشمالية',
  MG: 'مدغشقر', MY: 'ماليزيا', MW: 'ملاوي', MV: 'المالديف', ML: 'مالي',
  MT: 'مالطا', MU: 'موريشيوس', MR: 'موريتانيا', MX: 'المكسيك',
  FM: 'ميكرونيزيا', MD: 'مولدوفا', MC: 'موناكو', MN: 'منغوليا',
  ME: 'الجبل الأسود', MZ: 'موزمبيق', NA: 'ناميبيا', NR: 'ناورو',
  NP: 'نيبال', NI: 'نيكاراغوا', NE: 'النيجر', NG: 'نيجيريا',
  NO: 'النرويج', NZ: 'نيوزيلندا', OM: 'عُمان', UG: 'أوغندا',
  UZ: 'أوزبكستان', PK: 'باكستان', PW: 'بالاو', PS: 'فلسطين',
  PA: 'بنما', PG: 'بابوا غينيا الجديدة', PY: 'باراغواي', NL: 'هولندا',
  PE: 'بيرو', PH: 'الفلبين', PL: 'بولندا', PT: 'البرتغال', QA: 'قطر',
  RO: 'رومانيا', GB: 'المملكة المتحدة', RU: 'روسيا', RW: 'رواندا',
  KN: 'سانت كيتس ونيفيس', SM: 'سان مارينو', VC: 'سانت فينسنت والغرينادين',
  LC: 'سانت لوسيا', SB: 'جزر سليمان', SV: 'السلفادور', WS: 'ساموا',
  ST: 'ساو تومي وبرينسيبي', SN: 'السنغال', RS: 'صربيا', SC: 'سيشل',
  SL: 'سيراليون', SG: 'سنغافورة', SK: 'سلوفاكيا', SI: 'سلوفينيا',
  SO: 'الصومال', SD: 'السودان', SS: 'جنوب السودان', LK: 'سريلانكا',
  SE: 'السويد', CH: 'سويسرا', SR: 'سورينام', SY: 'سوريا',
  TJ: 'طاجيكستان', TW: 'تايوان', TZ: 'تنزانيا', TD: 'تشاد',
  CZ: 'التشيك', TH: 'تايلاند', TL: 'تيمور الشرقية', TG: 'توغو',
  TO: 'تونغا', TT: 'ترينيداد وتوباغو', TN: 'تونس', TM: 'تركمانستان',
  TR: 'تركيا', TV: 'توفالو', UA: 'أوكرانيا', UY: 'أوروغواي',
  VU: 'فانواتو', VA: 'الفاتيكان', VE: 'فنزويلا', VN: 'فيتنام',
  YE: 'اليمن', ZM: 'زامبيا', ZW: 'زيمبابوي',
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
 * prefix of both Algeria's "+213" and Tunisia's "+216"). When several
 * countries share the matched code (NANP "+1", or "+7"), the one marked
 * `primary` wins. Falls back to Morocco with the whole string treated as
 * the local number when nothing matches — covers empty values and legacy
 * numbers saved without a "+" before this feature existed. */
export function parsePhone(phone: string | null | undefined): { iso: string; localNumber: string } {
  const trimmed = (phone ?? '').trim();
  if (trimmed.startsWith('+')) {
    const byLongestCode = [...DIAL_CODES].sort((a, b) => b.dialCode.length - a.dialCode.length);
    const matchedCode = byLongestCode.find(c => trimmed.startsWith(c.dialCode))?.dialCode;
    if (matchedCode) {
      const candidates = DIAL_CODES.filter(c => c.dialCode === matchedCode);
      const chosen = candidates.find(c => c.primary) ?? candidates[0]!;
      return { iso: chosen.iso, localNumber: trimmed.slice(matchedCode.length).trim() };
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
