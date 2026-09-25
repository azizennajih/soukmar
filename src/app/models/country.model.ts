// Single source of truth for the site-wide "which country am I browsing/
// listing in" concept (Listing.country) — distinct from TRANSPORT's
// DESTINATION_COUNTRY attribute (TRANSPORT_COUNTRIES/TRANSPORT_COUNTRY_REGIONS
// in listing.model.ts: a deliberately-scoped 30-country cargo destination
// list, unrelated value space). Codes are ISO 3166-1 alpha-2 so flags and
// localized names can be derived instead of hand-maintained. Must stay in
// sync with soukmar-backend's src/lib/countries.ts (same COUNTRIES array).
//
// Country *names* are never hand-translated here — Intl.DisplayNames (CLDR,
// built into every modern browser) renders them per UI language on demand,
// so this file only carries the two facts that genuinely need curating:
// which continent group a country's flag sorts under, and its primary
// currency.

export type ContinentRegion = 'MOROCCO' | 'AFRICA' | 'EUROPE' | 'ASIA' | 'NORTH_AMERICA' | 'SOUTH_AMERICA' | 'OCEANIA';

export interface CountryInfo {
  code: string;
  region: ContinentRegion;
  currency: string;
}

export const COUNTRIES: CountryInfo[] = [
  { code: 'MA', region: 'MOROCCO', currency: 'MAD' },

  // Africa
  { code: 'DZ', region: 'AFRICA', currency: 'DZD' },
  { code: 'TN', region: 'AFRICA', currency: 'TND' },
  { code: 'LY', region: 'AFRICA', currency: 'LYD' },
  { code: 'EG', region: 'AFRICA', currency: 'EGP' },
  { code: 'SD', region: 'AFRICA', currency: 'SDG' },
  { code: 'SS', region: 'AFRICA', currency: 'SSP' },
  { code: 'MR', region: 'AFRICA', currency: 'MRU' },
  { code: 'ML', region: 'AFRICA', currency: 'XOF' },
  { code: 'NE', region: 'AFRICA', currency: 'XOF' },
  { code: 'TD', region: 'AFRICA', currency: 'XAF' },
  { code: 'SN', region: 'AFRICA', currency: 'XOF' },
  { code: 'GM', region: 'AFRICA', currency: 'GMD' },
  { code: 'GW', region: 'AFRICA', currency: 'XOF' },
  { code: 'GN', region: 'AFRICA', currency: 'GNF' },
  { code: 'SL', region: 'AFRICA', currency: 'SLE' },
  { code: 'LR', region: 'AFRICA', currency: 'LRD' },
  { code: 'CI', region: 'AFRICA', currency: 'XOF' },
  { code: 'GH', region: 'AFRICA', currency: 'GHS' },
  { code: 'TG', region: 'AFRICA', currency: 'XOF' },
  { code: 'BJ', region: 'AFRICA', currency: 'XOF' },
  { code: 'NG', region: 'AFRICA', currency: 'NGN' },
  { code: 'CM', region: 'AFRICA', currency: 'XAF' },
  { code: 'CF', region: 'AFRICA', currency: 'XAF' },
  { code: 'GQ', region: 'AFRICA', currency: 'XAF' },
  { code: 'GA', region: 'AFRICA', currency: 'XAF' },
  { code: 'CG', region: 'AFRICA', currency: 'XAF' },
  { code: 'CD', region: 'AFRICA', currency: 'CDF' },
  { code: 'AO', region: 'AFRICA', currency: 'AOA' },
  { code: 'ZM', region: 'AFRICA', currency: 'ZMW' },
  { code: 'MW', region: 'AFRICA', currency: 'MWK' },
  { code: 'MZ', region: 'AFRICA', currency: 'MZN' },
  { code: 'ZW', region: 'AFRICA', currency: 'ZWL' },
  { code: 'BW', region: 'AFRICA', currency: 'BWP' },
  { code: 'NA', region: 'AFRICA', currency: 'NAD' },
  { code: 'ZA', region: 'AFRICA', currency: 'ZAR' },
  { code: 'LS', region: 'AFRICA', currency: 'LSL' },
  { code: 'SZ', region: 'AFRICA', currency: 'SZL' },
  { code: 'KE', region: 'AFRICA', currency: 'KES' },
  { code: 'TZ', region: 'AFRICA', currency: 'TZS' },
  { code: 'UG', region: 'AFRICA', currency: 'UGX' },
  { code: 'RW', region: 'AFRICA', currency: 'RWF' },
  { code: 'BI', region: 'AFRICA', currency: 'BIF' },
  { code: 'ET', region: 'AFRICA', currency: 'ETB' },
  { code: 'ER', region: 'AFRICA', currency: 'ERN' },
  { code: 'DJ', region: 'AFRICA', currency: 'DJF' },
  { code: 'SO', region: 'AFRICA', currency: 'SOS' },
  { code: 'BF', region: 'AFRICA', currency: 'XOF' },
  { code: 'CV', region: 'AFRICA', currency: 'CVE' },
  { code: 'ST', region: 'AFRICA', currency: 'STN' },
  { code: 'SC', region: 'AFRICA', currency: 'SCR' },
  { code: 'MU', region: 'AFRICA', currency: 'MUR' },
  { code: 'MG', region: 'AFRICA', currency: 'MGA' },
  { code: 'KM', region: 'AFRICA', currency: 'KMF' },

  // Europe
  { code: 'FR', region: 'EUROPE', currency: 'EUR' },
  { code: 'ES', region: 'EUROPE', currency: 'EUR' },
  { code: 'DE', region: 'EUROPE', currency: 'EUR' },
  { code: 'IT', region: 'EUROPE', currency: 'EUR' },
  { code: 'PT', region: 'EUROPE', currency: 'EUR' },
  { code: 'NL', region: 'EUROPE', currency: 'EUR' },
  { code: 'BE', region: 'EUROPE', currency: 'EUR' },
  { code: 'LU', region: 'EUROPE', currency: 'EUR' },
  { code: 'GB', region: 'EUROPE', currency: 'GBP' },
  { code: 'IE', region: 'EUROPE', currency: 'EUR' },
  { code: 'CH', region: 'EUROPE', currency: 'CHF' },
  { code: 'AT', region: 'EUROPE', currency: 'EUR' },
  { code: 'SE', region: 'EUROPE', currency: 'SEK' },
  { code: 'NO', region: 'EUROPE', currency: 'NOK' },
  { code: 'DK', region: 'EUROPE', currency: 'DKK' },
  { code: 'FI', region: 'EUROPE', currency: 'EUR' },
  { code: 'IS', region: 'EUROPE', currency: 'ISK' },
  { code: 'PL', region: 'EUROPE', currency: 'PLN' },
  { code: 'CZ', region: 'EUROPE', currency: 'CZK' },
  { code: 'SK', region: 'EUROPE', currency: 'EUR' },
  { code: 'HU', region: 'EUROPE', currency: 'HUF' },
  { code: 'RO', region: 'EUROPE', currency: 'RON' },
  { code: 'BG', region: 'EUROPE', currency: 'BGN' },
  { code: 'GR', region: 'EUROPE', currency: 'EUR' },
  { code: 'HR', region: 'EUROPE', currency: 'EUR' },
  { code: 'SI', region: 'EUROPE', currency: 'EUR' },
  { code: 'RS', region: 'EUROPE', currency: 'RSD' },
  { code: 'BA', region: 'EUROPE', currency: 'BAM' },
  { code: 'ME', region: 'EUROPE', currency: 'EUR' },
  { code: 'MK', region: 'EUROPE', currency: 'MKD' },
  { code: 'AL', region: 'EUROPE', currency: 'ALL' },
  { code: 'XK', region: 'EUROPE', currency: 'EUR' },
  { code: 'LT', region: 'EUROPE', currency: 'EUR' },
  { code: 'LV', region: 'EUROPE', currency: 'EUR' },
  { code: 'EE', region: 'EUROPE', currency: 'EUR' },
  { code: 'MD', region: 'EUROPE', currency: 'MDL' },
  { code: 'UA', region: 'EUROPE', currency: 'UAH' },
  { code: 'BY', region: 'EUROPE', currency: 'BYN' },
  { code: 'RU', region: 'EUROPE', currency: 'RUB' },
  { code: 'MT', region: 'EUROPE', currency: 'EUR' },
  { code: 'CY', region: 'EUROPE', currency: 'EUR' },
  { code: 'AD', region: 'EUROPE', currency: 'EUR' },
  { code: 'MC', region: 'EUROPE', currency: 'EUR' },
  { code: 'LI', region: 'EUROPE', currency: 'CHF' },
  { code: 'SM', region: 'EUROPE', currency: 'EUR' },
  { code: 'VA', region: 'EUROPE', currency: 'EUR' },

  // Asia (incl. Middle East)
  { code: 'TR', region: 'ASIA', currency: 'TRY' },
  { code: 'IL', region: 'ASIA', currency: 'ILS' },
  { code: 'PS', region: 'ASIA', currency: 'ILS' },
  { code: 'JO', region: 'ASIA', currency: 'JOD' },
  { code: 'LB', region: 'ASIA', currency: 'LBP' },
  { code: 'SY', region: 'ASIA', currency: 'SYP' },
  { code: 'IQ', region: 'ASIA', currency: 'IQD' },
  { code: 'SA', region: 'ASIA', currency: 'SAR' },
  { code: 'YE', region: 'ASIA', currency: 'YER' },
  { code: 'OM', region: 'ASIA', currency: 'OMR' },
  { code: 'AE', region: 'ASIA', currency: 'AED' },
  { code: 'QA', region: 'ASIA', currency: 'QAR' },
  { code: 'BH', region: 'ASIA', currency: 'BHD' },
  { code: 'KW', region: 'ASIA', currency: 'KWD' },
  { code: 'IR', region: 'ASIA', currency: 'IRR' },
  { code: 'AF', region: 'ASIA', currency: 'AFN' },
  { code: 'PK', region: 'ASIA', currency: 'PKR' },
  { code: 'IN', region: 'ASIA', currency: 'INR' },
  { code: 'BD', region: 'ASIA', currency: 'BDT' },
  { code: 'LK', region: 'ASIA', currency: 'LKR' },
  { code: 'NP', region: 'ASIA', currency: 'NPR' },
  { code: 'BT', region: 'ASIA', currency: 'BTN' },
  { code: 'MM', region: 'ASIA', currency: 'MMK' },
  { code: 'TH', region: 'ASIA', currency: 'THB' },
  { code: 'LA', region: 'ASIA', currency: 'LAK' },
  { code: 'KH', region: 'ASIA', currency: 'KHR' },
  { code: 'VN', region: 'ASIA', currency: 'VND' },
  { code: 'MY', region: 'ASIA', currency: 'MYR' },
  { code: 'SG', region: 'ASIA', currency: 'SGD' },
  { code: 'ID', region: 'ASIA', currency: 'IDR' },
  { code: 'PH', region: 'ASIA', currency: 'PHP' },
  { code: 'BN', region: 'ASIA', currency: 'BND' },
  { code: 'TL', region: 'ASIA', currency: 'USD' },
  { code: 'CN', region: 'ASIA', currency: 'CNY' },
  { code: 'JP', region: 'ASIA', currency: 'JPY' },
  { code: 'KR', region: 'ASIA', currency: 'KRW' },
  { code: 'KP', region: 'ASIA', currency: 'KPW' },
  { code: 'MN', region: 'ASIA', currency: 'MNT' },
  { code: 'TW', region: 'ASIA', currency: 'TWD' },
  { code: 'HK', region: 'ASIA', currency: 'HKD' },
  { code: 'MO', region: 'ASIA', currency: 'MOP' },
  { code: 'KZ', region: 'ASIA', currency: 'KZT' },
  { code: 'UZ', region: 'ASIA', currency: 'UZS' },
  { code: 'TM', region: 'ASIA', currency: 'TMT' },
  { code: 'TJ', region: 'ASIA', currency: 'TJS' },
  { code: 'KG', region: 'ASIA', currency: 'KGS' },
  { code: 'AM', region: 'ASIA', currency: 'AMD' },
  { code: 'AZ', region: 'ASIA', currency: 'AZN' },
  { code: 'GE', region: 'ASIA', currency: 'GEL' },
  { code: 'MV', region: 'ASIA', currency: 'MVR' },

  // North America (incl. Central America & Caribbean)
  { code: 'US', region: 'NORTH_AMERICA', currency: 'USD' },
  { code: 'CA', region: 'NORTH_AMERICA', currency: 'CAD' },
  { code: 'MX', region: 'NORTH_AMERICA', currency: 'MXN' },
  { code: 'GT', region: 'NORTH_AMERICA', currency: 'GTQ' },
  { code: 'BZ', region: 'NORTH_AMERICA', currency: 'BZD' },
  { code: 'SV', region: 'NORTH_AMERICA', currency: 'USD' },
  { code: 'HN', region: 'NORTH_AMERICA', currency: 'HNL' },
  { code: 'NI', region: 'NORTH_AMERICA', currency: 'NIO' },
  { code: 'CR', region: 'NORTH_AMERICA', currency: 'CRC' },
  { code: 'PA', region: 'NORTH_AMERICA', currency: 'PAB' },
  { code: 'CU', region: 'NORTH_AMERICA', currency: 'CUP' },
  { code: 'JM', region: 'NORTH_AMERICA', currency: 'JMD' },
  { code: 'HT', region: 'NORTH_AMERICA', currency: 'HTG' },
  { code: 'DO', region: 'NORTH_AMERICA', currency: 'DOP' },
  { code: 'BS', region: 'NORTH_AMERICA', currency: 'BSD' },
  { code: 'BB', region: 'NORTH_AMERICA', currency: 'BBD' },
  { code: 'TT', region: 'NORTH_AMERICA', currency: 'TTD' },
  { code: 'GD', region: 'NORTH_AMERICA', currency: 'XCD' },
  { code: 'LC', region: 'NORTH_AMERICA', currency: 'XCD' },
  { code: 'VC', region: 'NORTH_AMERICA', currency: 'XCD' },
  { code: 'AG', region: 'NORTH_AMERICA', currency: 'XCD' },
  { code: 'DM', region: 'NORTH_AMERICA', currency: 'XCD' },
  { code: 'KN', region: 'NORTH_AMERICA', currency: 'XCD' },

  // South America
  { code: 'BR', region: 'SOUTH_AMERICA', currency: 'BRL' },
  { code: 'AR', region: 'SOUTH_AMERICA', currency: 'ARS' },
  { code: 'CL', region: 'SOUTH_AMERICA', currency: 'CLP' },
  { code: 'CO', region: 'SOUTH_AMERICA', currency: 'COP' },
  { code: 'PE', region: 'SOUTH_AMERICA', currency: 'PEN' },
  { code: 'VE', region: 'SOUTH_AMERICA', currency: 'VES' },
  { code: 'EC', region: 'SOUTH_AMERICA', currency: 'USD' },
  { code: 'BO', region: 'SOUTH_AMERICA', currency: 'BOB' },
  { code: 'PY', region: 'SOUTH_AMERICA', currency: 'PYG' },
  { code: 'UY', region: 'SOUTH_AMERICA', currency: 'UYU' },
  { code: 'GY', region: 'SOUTH_AMERICA', currency: 'GYD' },
  { code: 'SR', region: 'SOUTH_AMERICA', currency: 'SRD' },

  // Oceania
  { code: 'AU', region: 'OCEANIA', currency: 'AUD' },
  { code: 'NZ', region: 'OCEANIA', currency: 'NZD' },
  { code: 'FJ', region: 'OCEANIA', currency: 'FJD' },
  { code: 'PG', region: 'OCEANIA', currency: 'PGK' },
  { code: 'SB', region: 'OCEANIA', currency: 'SBD' },
  { code: 'VU', region: 'OCEANIA', currency: 'VUV' },
  { code: 'WS', region: 'OCEANIA', currency: 'WST' },
  { code: 'TO', region: 'OCEANIA', currency: 'TOP' },
];

const BY_CODE = new Map(COUNTRIES.map(c => [c.code, c]));

/** Groups the full country list into <optgroup>s for pickers — Morocco
 * pinned first as the platform's home market (matching dial-codes.ts's own
 * "Morocco first" convention), then continents in a fixed, stable order. */
export const COUNTRY_REGIONS: { region: ContinentRegion; countries: string[] }[] = (
  ['MOROCCO', 'AFRICA', 'EUROPE', 'ASIA', 'NORTH_AMERICA', 'SOUTH_AMERICA', 'OCEANIA'] as ContinentRegion[]
).map(region => ({ region, countries: COUNTRIES.filter(c => c.region === region).map(c => c.code) }));

/** Continents shown in full in the country switcher/picker UI — no per-country
 * curation needed, every country in these regions is pickable. */
const FULLY_VISIBLE_REGIONS: ContinentRegion[] = ['MOROCCO', 'AFRICA', 'SOUTH_AMERICA', 'EUROPE', 'NORTH_AMERICA'];

/** Individually curated countries in the remaining (not-fully-open) regions:
 * Arab League / Muslim-majority countries in Asia (Middle East + Central/
 * South/Southeast Asia + the two Muslim-majority Balkan states, filed under
 * ASIA/EUROPE in COUNTRY_REGIONS) plus Australia in Oceania. */
const ADDITIONAL_VISIBLE_COUNTRIES = new Set<string>([
  'JO', 'LB', 'SY', 'IQ', 'SA', 'YE', 'OM', 'AE', 'QA', 'BH', 'KW', 'PS',
  'TR', 'IR', 'AF', 'PK', 'BD', 'ID', 'MY', 'BN', 'MV', 'AZ', 'KZ', 'UZ', 'TM', 'KG', 'TJ',
  'AL', 'XK',
  'AU',
]);

/** Countries currently shown in the country switcher/picker UI — Nutzerentscheidung
 * (2026-09-23, erweitert 2026-09-25 um Europa/Nordamerika/Australien): Morocco
 * + all of Africa + all of South America + all of Europe + all of North
 * America + Arab/Islamic countries elsewhere + Australia; everything else
 * (rest of Oceania, Asia outside the curated list) stays hidden for now.
 * Deliberately a UI-only filter of COUNTRY_REGIONS: COUNTRIES/BY_CODE/
 * currencyForCountry/isKnownCountry/countryName all keep working for every
 * one of the ~195 countries unfiltered, so a hidden country's data is never
 * deleted — only not offered for picking yet. Re-enabling a market later is
 * a one-line change here (add to FULLY_VISIBLE_REGIONS or the Set above),
 * not a data-model change. */
export const VISIBLE_COUNTRY_REGIONS: { region: ContinentRegion; countries: string[] }[] = COUNTRY_REGIONS
  .map(g => ({
    region: g.region,
    countries: FULLY_VISIBLE_REGIONS.includes(g.region)
      ? g.countries
      : g.countries.filter(c => ADDITIONAL_VISIBLE_COUNTRIES.has(c)),
  }))
  .filter(g => g.countries.length > 0);

export function currencyForCountry(code: string): string {
  return BY_CODE.get(code)?.currency ?? 'USD';
}

export function isKnownCountry(code: string): boolean {
  return BY_CODE.has(code);
}

const VISIBLE_COUNTRY_CODES = new Set(VISIBLE_COUNTRY_REGIONS.flatMap(g => g.countries));

/** Whether a country is one of the current soft-launch markets, i.e. shown
 * as a pickable option in VISIBLE_COUNTRY_REGIONS — use this before defaulting
 * a <select> bound to that list from a country that can be *any* of the ~195
 * (e.g. CountryService.country(), IP-detected and unrestricted), or the
 * default silently renders as unselected. */
export function isVisibleCountry(code: string): boolean {
  return VISIBLE_COUNTRY_CODES.has(code);
}

/** Localized display name via Intl.DisplayNames (CLDR) — zero-maintenance,
 * always accurate, works for all ~195 countries in every UI language. */
export function countryName(code: string, lang: string): string {
  try {
    return new Intl.DisplayNames([lang], { type: 'region' }).of(code) ?? code;
  } catch {
    return code;
  }
}

/** Major/mid-size cities for the ~30 countries curated in the previous
 * "Transport anbieten" round (moved here from TRANSPORT_CITIES_BY_COUNTRY,
 * re-keyed from English-name codes to ISO codes). Every other country in
 * COUNTRIES has no entry here on purpose — app-text-autocomplete with an
 * empty options array is just a free-text input, so Listing.city (already a
 * free string) works identically either way, only without suggestions. A
 * genuinely exhaustive per-city database for all ~195 countries isn't
 * maintainable by hand (see country.model.ts's file header). */
export const CITIES_BY_COUNTRY: Record<string, string[]> = {
  FR: [
    'Paris', 'Marseille', 'Lyon', 'Toulouse', 'Nice', 'Nantes', 'Strasbourg', 'Montpellier', 'Bordeaux', 'Lille',
    'Rennes', 'Reims', 'Le Havre', 'Saint-Étienne', 'Toulon', 'Grenoble', 'Dijon', 'Angers', 'Nîmes', 'Villeurbanne',
    'Clermont-Ferrand', 'Le Mans', 'Aix-en-Provence', 'Brest', 'Tours', 'Limoges', 'Amiens', 'Annecy', 'Perpignan', 'Besançon',
    'Metz', 'Orléans', 'Rouen', 'Mulhouse', 'Caen', 'Nancy', 'Argenteuil', 'Saint-Denis', 'Roubaix', 'Tourcoing',
    'Avignon', 'Créteil', 'Poitiers', 'Versailles', 'Pau', 'La Rochelle', 'Calais', 'Cannes', 'Antibes', 'Béziers',
  ],
  ES: [
    'Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Zaragoza', 'Malaga', 'Murcia', 'Palma', 'Las Palmas', 'Bilbao',
    'Alicante', 'Córdoba', 'Valladolid', 'Vigo', 'Gijón', 'Vitoria-Gasteiz', 'A Coruña', 'Granada', 'Elche', 'Oviedo',
    'Badalona', 'Cartagena', 'Terrassa', 'Jerez de la Frontera', 'Sabadell', 'Móstoles', 'Alcalá de Henares', 'Pamplona', 'Fuenlabrada', 'Almería',
    'San Sebastián', 'Leganés', 'Santander', 'Burgos', 'Castellón de la Plana', 'Getafe', 'Albacete', 'Alcorcón', 'Logroño', 'Badajoz',
    'Salamanca', 'Huelva', 'Marbella', 'Tarragona', 'León', 'Cádiz', 'Lleida', 'Dos Hermanas', 'Mataró', 'Santa Cruz de Tenerife',
  ],
  DE: [
    'Berlin', 'Hamburg', 'Munich', 'Cologne', 'Frankfurt', 'Stuttgart', 'Düsseldorf', 'Leipzig', 'Dortmund', 'Essen',
    'Bremen', 'Dresden', 'Hannover', 'Nuremberg', 'Duisburg', 'Bochum', 'Wuppertal', 'Bielefeld', 'Bonn', 'Münster',
    'Mannheim', 'Karlsruhe', 'Augsburg', 'Wiesbaden', 'Mönchengladbach', 'Gelsenkirchen', 'Braunschweig', 'Chemnitz', 'Kiel', 'Aachen',
    'Halle', 'Magdeburg', 'Freiburg', 'Krefeld', 'Lübeck', 'Oberhausen', 'Erfurt', 'Mainz', 'Rostock', 'Kassel',
    'Hagen', 'Saarbrücken', 'Hamm', 'Potsdam', 'Ludwigshafen', 'Oldenburg', 'Leverkusen', 'Osnabrück', 'Solingen', 'Heidelberg',
  ],
  IT: [
    'Rome', 'Milan', 'Naples', 'Turin', 'Palermo', 'Genoa', 'Bologna', 'Florence', 'Bari', 'Catania',
    'Venice', 'Verona', 'Messina', 'Padua', 'Trieste', 'Taranto', 'Brescia', 'Parma', 'Prato', 'Modena',
    'Reggio Calabria', 'Reggio Emilia', 'Perugia', 'Ravenna', 'Livorno', 'Cagliari', 'Foggia', 'Rimini', 'Salerno', 'Ferrara',
    'Sassari', 'Latina', 'Monza', 'Syracuse', 'Pescara', 'Bergamo', 'Trento', 'Forlì', 'Vicenza', 'Terni',
    'Bolzano', 'Novara', 'Piacenza', 'Ancona', 'Andria', 'Arezzo', 'Udine', 'Cesena', 'Lecce', 'La Spezia',
  ],
  PT: [
    'Lisbon', 'Porto', 'Vila Nova de Gaia', 'Amadora', 'Braga', 'Funchal', 'Coimbra', 'Setúbal', 'Almada', 'Agualva-Cacém',
    'Queluz', 'Barreiro', 'Aveiro', 'Faro', 'Évora', 'Viseu', 'Guimarães', 'Leiria', 'Portimão', 'Odivelas',
    'Barcelos', 'Póvoa de Varzim', 'Rio Maior', 'Viana do Castelo', 'Vila Real', 'Covilhã', 'Tomar', 'Torres Vedras', 'Peniche', 'Elvas',
    'Beja', 'Chaves', 'Estoril', 'Cascais', 'Sintra', 'Loures', 'Matosinhos',
  ],
  NL: [
    'Amsterdam', 'Rotterdam', 'The Hague', 'Utrecht', 'Eindhoven', 'Tilburg', 'Groningen', 'Almere', 'Breda', 'Nijmegen',
    'Enschede', 'Haarlem', 'Arnhem', 'Zaanstad', 'Amersfoort', 'Apeldoorn', 'Hoofddorp', 'Maastricht', 'Leiden', 'Dordrecht',
    'Zoetermeer', 'Zwolle', 'Deventer', 'Delft', 'Alkmaar', 'Heerlen', 'Venlo', 'Leeuwarden', 'Hilversum', 'Amstelveen',
    'Purmerend', 'Roosendaal', 'Oss', 'Schiedam', 'Spijkenisse', 'Vlaardingen', 'Almelo', 'Gouda', 'Hengelo', 'Emmen',
  ],
  BE: [
    'Brussels', 'Antwerp', 'Ghent', 'Charleroi', 'Liège', 'Bruges', 'Namur', 'Leuven', 'Mons', 'Aalst',
    'Mechelen', 'La Louvière', 'Kortrijk', 'Hasselt', 'Sint-Niklaas', 'Ostend', 'Tournai', 'Genk', 'Seraing', 'Roeselare',
    'Verviers', 'Mouscron', 'Beveren', 'Dendermonde', 'Beringen', 'Turnhout', 'Dilbeek', 'Heist-op-den-Berg', 'Lokeren', 'Vilvoorde',
  ],
  GB: [
    'London', 'Birmingham', 'Manchester', 'Glasgow', 'Liverpool', 'Leeds', 'Sheffield', 'Edinburgh', 'Bristol', 'Cardiff',
    'Leicester', 'Belfast', 'Nottingham', 'Newcastle upon Tyne', 'Southampton', 'Portsmouth', 'Bradford', 'Coventry', 'Kingston upon Hull', 'Stoke-on-Trent',
    'Wolverhampton', 'Plymouth', 'Derby', 'Swansea', 'Aberdeen', 'Reading', 'Milton Keynes', 'Northampton', 'Norwich', 'Luton',
    'York', 'Oxford', 'Cambridge', 'Preston', 'Sunderland', 'Middlesbrough', 'Blackpool', 'Bolton', 'Ipswich', 'Watford',
    'Slough', 'Exeter', 'Gloucester', 'Dundee', 'Blackburn', 'Southend-on-Sea', 'Peterborough', 'Bath', 'Brighton', 'Warrington',
  ],
  CH: [
    'Zurich', 'Geneva', 'Basel', 'Lausanne', 'Bern', 'Winterthur', 'Lucerne', 'St. Gallen', 'Lugano', 'Biel/Bienne',
    'Thun', 'Köniz', 'La Chaux-de-Fonds', 'Fribourg', 'Schaffhausen', 'Chur', 'Vernier', 'Neuchâtel', 'Uster', 'Sion',
    'Emmen', 'Zug', 'Yverdon-les-Bains', 'Kriens', 'Rapperswil-Jona', 'Dübendorf', 'Montreux', 'Dietikon', 'Frauenfeld', 'Wetzikon',
  ],
  AT: [
    'Vienna', 'Graz', 'Linz', 'Salzburg', 'Innsbruck', 'Klagenfurt', 'Villach', 'Wels', 'Sankt Pölten', 'Dornbirn',
    'Wiener Neustadt', 'Steyr', 'Feldkirch', 'Bregenz', 'Leonding', 'Klosterneuburg', 'Baden', 'Wolfsberg', 'Leoben', 'Krems an der Donau',
    'Traun', 'Amstetten', 'Lustenau', 'Kapfenberg', 'Hallein',
  ],
  SE: [
    'Stockholm', 'Gothenburg', 'Malmö', 'Uppsala', 'Västerås', 'Örebro', 'Linköping', 'Helsingborg', 'Jönköping', 'Norrköping',
    'Lund', 'Umeå', 'Gävle', 'Borås', 'Södertälje', 'Eskilstuna', 'Halmstad', 'Växjö', 'Karlstad', 'Sundsvall',
    'Trollhättan', 'Östersund', 'Borlänge', 'Falun', 'Kalmar',
  ],
  PL: [
    'Warsaw', 'Kraków', 'Łódź', 'Wrocław', 'Poznań', 'Gdańsk', 'Szczecin', 'Bydgoszcz', 'Lublin', 'Białystok',
    'Katowice', 'Gdynia', 'Częstochowa', 'Radom', 'Sosnowiec', 'Toruń', 'Kielce', 'Gliwice', 'Zabrze', 'Bytom',
    'Olsztyn', 'Bielsko-Biała', 'Rzeszów', 'Ruda Śląska', 'Rybnik', 'Tychy', 'Opole', 'Gorzów Wielkopolski', 'Płock', 'Wałbrzych',
    'Włocławek', 'Elbląg', 'Zielona Góra', 'Koszalin',
  ],
  GR: [
    'Athens', 'Thessaloniki', 'Patras', 'Heraklion', 'Larissa', 'Volos', 'Rhodes', 'Ioannina', 'Chania', 'Chalcis',
    'Agrinio', 'Katerini', 'Trikala', 'Serres', 'Lamia', 'Alexandroupoli', 'Xanthi', 'Kavala', 'Kalamata', 'Kozani',
    'Veroia', 'Drama', 'Komotini', 'Rethymno', 'Karditsa',
  ],
  IE: [
    'Dublin', 'Cork', 'Limerick', 'Galway', 'Waterford', 'Drogheda', 'Dundalk', 'Swords', 'Bray', 'Navan',
    'Kilkenny', 'Ennis', 'Carlow', 'Tralee', 'Naas', 'Sligo', 'Athlone', 'Wexford', 'Letterkenny', 'Celbridge',
  ],
  DK: [
    'Copenhagen', 'Aarhus', 'Odense', 'Aalborg', 'Esbjerg', 'Randers', 'Kolding', 'Horsens', 'Vejle', 'Roskilde',
    'Herning', 'Silkeborg', 'Næstved', 'Fredericia', 'Viborg', 'Køge', 'Holstebro', 'Taastrup', 'Slagelse', 'Hillerød',
  ],
  DZ: [
    'Algiers', 'Oran', 'Constantine', 'Annaba', 'Blida', 'Batna', 'Djelfa', 'Sétif', 'Sidi Bel Abbès', 'Biskra',
    'Tébessa', 'Tlemcen', 'Béjaïa', 'Skikda', 'Tiaret', 'Ouargla', 'Bordj Bou Arréridj', 'Béchar', 'Mostaganem', 'Chlef',
    'Médéa', 'El Oued', 'Relizane', 'Tizi Ouzou', "M'Sila", 'Mascara', 'Ghardaïa', 'Souk Ahras', 'Jijel', 'Saïda',
  ],
  TN: [
    'Tunis', 'Sfax', 'Sousse', 'Kairouan', 'Bizerte', 'Gabès', 'Ariana', 'Gafsa', 'Monastir', 'Ben Arous',
    'Kasserine', 'Médenine', 'Nabeul', 'Tataouine', 'Béja', 'Jendouba', 'Mahdia', 'Sidi Bouzid', 'Tozeur', 'Zaghouan',
    'Siliana', 'Kef', 'Manouba',
  ],
  LY: ['Tripoli', 'Benghazi', 'Misrata', 'Zawiya', 'Bayda', 'Zliten', 'Ajdabiya', 'Tobruk', 'Sabha', 'Sirte', 'Derna', 'Khoms'],
  MR: ['Nouakchott', 'Nouadhibou', 'Kiffa', 'Kaédi', 'Rosso', 'Zouérat', 'Atar', 'Néma', 'Sélibaby', 'Aleg', 'Akjoujt'],
  SN: [
    'Dakar', 'Touba', 'Thiès', 'Kaolack', "M'bour", 'Ziguinchor', 'Diourbel', 'Saint-Louis', 'Louga', 'Tambacounda',
    'Kolda', 'Rufisque', 'Mbacké', 'Richard Toll', 'Kaffrine', 'Fatick', 'Kédougou',
  ],
  ML: ['Bamako', 'Sikasso', 'Mopti', 'Koutiala', 'Ségou', 'Kayes', 'Gao', 'Kati', 'San', 'Timbuktu', 'Kolondiéba', 'Bougouni', 'Koulikoro'],
  EG: [
    'Cairo', 'Alexandria', 'Giza', 'Shubra El Kheima', 'Port Said', 'Suez', 'Luxor', 'Mansoura', 'El Mahalla El Kubra', 'Tanta',
    'Asyut', 'Ismailia', 'Faiyum', 'Zagazig', 'Aswan', 'Damietta', 'Damanhur', 'Minya', 'Beni Suef', 'Qena',
    'Sohag', 'Hurghada', '6th of October City', 'Shibin El Kom', 'Banha',
  ],
  NG: [
    'Lagos', 'Kano', 'Ibadan', 'Abuja', 'Port Harcourt', 'Benin City', 'Maiduguri', 'Zaria', 'Aba', 'Jos',
    'Ilorin', 'Oyo', 'Enugu', 'Abeokuta', 'Kaduna', 'Onitsha', 'Warri', 'Sokoto', 'Calabar', 'Katsina',
    'Akure', 'Bauchi', 'Owerri', 'Uyo', 'Ado-Ekiti',
  ],
  CI: [
    'Abidjan', 'Bouaké', 'Daloa', 'Yamoussoukro', 'Korhogo', 'San-Pédro', 'Man', 'Divo', 'Gagnoa', 'Anyama',
    'Abengourou', 'Agboville', 'Grand-Bassam', 'Dabou', 'Bondoukou', 'Séguéla',
  ],
  GH: [
    'Accra', 'Kumasi', 'Tamale', 'Sekondi-Takoradi', 'Sunyani', 'Cape Coast', 'Obuasi', 'Teshie', 'Tema', 'Koforidua',
    'Ho', 'Wa', 'Bolgatanga', 'Techiman', 'Nkawkaw',
  ],
  CM: [
    'Douala', 'Yaoundé', 'Garoua', 'Bamenda', 'Maroua', 'Bafoussam', 'Ngaoundéré', 'Bertoua', 'Loum', 'Kumba',
    'Nkongsamba', 'Buea', 'Edéa', 'Kribi', 'Ebolowa',
  ],
  ZA: [
    'Johannesburg', 'Cape Town', 'Durban', 'Pretoria', 'Port Elizabeth', 'Bloemfontein', 'Nelspruit', 'Kimberley', 'Polokwane', 'Pietermaritzburg',
    'Rustenburg', 'George', 'Welkom', 'East London', 'Vereeniging', 'Klerksdorp', 'Potchefstroom', 'Vryburg', 'Upington', 'Worcester',
  ],
  KE: [
    'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika', 'Malindi', 'Kitale', 'Garissa', 'Kakamega',
    'Nyeri', 'Machakos', 'Meru', 'Kericho', 'Embu',
  ],
  ET: [
    'Addis Ababa', 'Dire Dawa', 'Mekelle', 'Gondar', 'Adama', 'Hawassa', 'Bahir Dar', 'Jimma', 'Jijiga', 'Dessie',
    'Shashamane', 'Bishoftu', 'Sodo', 'Arba Minch', 'Hosaena',
  ],
  TZ: [
    'Dar es Salaam', 'Dodoma', 'Mwanza', 'Arusha', 'Mbeya', 'Morogoro', 'Tanga', 'Kahama', 'Tabora', 'Zanzibar City',
    'Kigoma', 'Sumbawanga', 'Kasulu', 'Songea', 'Musoma',
  ],
  SD: ['Khartoum', 'Omdurman', 'Nyala', 'Port Sudan', 'Kassala', 'El Obeid', 'Wad Madani', 'El Fasher', 'Gedaref', 'Kosti', 'Atbara', 'Dongola', 'Sennar', 'Nahud', 'El Daein'],
  SS: ['Juba', 'Wau', 'Malakal', 'Yei', 'Aweil', 'Bor', 'Yambio', 'Bentiu', 'Rumbek', 'Torit'],
  NE: ['Niamey', 'Zinder', 'Maradi', 'Agadez', 'Tahoua', 'Dosso', 'Tillabéri', 'Diffa', 'Arlit', "Birni-N'Konni"],
  TD: ["N'Djamena", 'Moundou', 'Sarh', 'Abéché', 'Kelo', 'Koumra', 'Pala', 'Am Timan', 'Bongor', 'Mongo'],
  GM: ['Banjul', 'Serekunda', 'Brikama', 'Bakau', 'Farafenni', 'Lamin', 'Sukuta', 'Basse Santa Su', 'Gunjur', 'Soma'],
  GW: ['Bissau', 'Bafatá', 'Gabú', 'Bissorã', 'Bolama', 'Cacheu', 'Catió', 'Farim', 'Mansôa', 'Buba'],
  GN: ['Conakry', 'Nzérékoré', 'Kankan', 'Kindia', 'Labé', 'Mamou', 'Boké', 'Faranah', 'Kissidougou', 'Siguiri'],
  SL: ['Freetown', 'Bo', 'Kenema', 'Makeni', 'Koidu', 'Waterloo', 'Lunsar', 'Port Loko', 'Kabala', 'Magburaka'],
  LR: ['Monrovia', 'Gbarnga', 'Kakata', 'Bensonville', 'Harper', 'Voinjama', 'Buchanan', 'Zwedru', 'Ganta', 'Robertsport'],
  TG: ['Lomé', 'Sokodé', 'Kara', 'Kpalimé', 'Atakpamé', 'Dapaong', 'Tsévié', 'Aného', 'Mango', 'Bassar'],
  BJ: ['Cotonou', 'Porto-Novo', 'Parakou', 'Djougou', 'Bohicon', 'Kandi', 'Abomey', 'Natitingou', 'Lokossa', 'Ouidah'],
  CF: ['Bangui', 'Bimbo', 'Berbérati', 'Carnot', 'Bambari', 'Bouar', 'Bossangoa', 'Bria', 'Bangassou', 'Nola'],
  GQ: ['Malabo', 'Bata', 'Ebebiyín', 'Aconibe', 'Añisoc', 'Luba', 'Evinayong', 'Mongomo', 'Mengomeyén', 'Micomeseng'],
  GA: ['Libreville', 'Port-Gentil', 'Franceville', 'Oyem', 'Moanda', 'Mouila', 'Lambaréné', 'Tchibanga', 'Koulamoutou', 'Makokou'],
  CG: ['Brazzaville', 'Pointe-Noire', 'Dolisie', 'Nkayi', 'Ouesso', 'Impfondo', 'Madingou', 'Owando', 'Sibiti', 'Gamboma'],
  CD: [
    'Kinshasa', 'Lubumbashi', 'Mbuji-Mayi', 'Kananga', 'Kisangani', 'Bukavu', 'Goma', 'Kolwezi', 'Likasi', 'Tshikapa',
    'Uvira', 'Matadi', 'Mbandaka', 'Kikwit', 'Bunia',
  ],
  AO: ['Luanda', 'Huambo', 'Lobito', 'Benguela', 'Kuito', 'Lubango', 'Malanje', 'Namibe', 'Soyo', 'Cabinda', 'Uíge', 'Saurimo'],
  ZM: ['Lusaka', 'Kitwe', 'Ndola', 'Kabwe', 'Chingola', 'Mufulira', 'Livingstone', 'Luanshya', 'Kasama', 'Chipata'],
  MW: ['Lilongwe', 'Blantyre', 'Mzuzu', 'Zomba', 'Kasungu', 'Mangochi', 'Karonga', 'Salima', 'Nkhotakota', 'Balaka'],
  MZ: ['Maputo', 'Matola', 'Beira', 'Nampula', 'Chimoio', 'Nacala', 'Quelimane', 'Tete', 'Xai-Xai', 'Lichinga', 'Pemba'],
  ZW: ['Harare', 'Bulawayo', 'Chitungwiza', 'Mutare', 'Gweru', 'Epworth', 'Kwekwe', 'Kadoma', 'Masvingo', 'Chinhoyi', 'Marondera'],
  BW: ['Gaborone', 'Francistown', 'Molepolole', 'Selebi-Phikwe', 'Maun', 'Serowe', 'Kanye', 'Mahalapye', 'Mochudi', 'Mogoditshane'],
  NA: ['Windhoek', 'Rundu', 'Walvis Bay', 'Swakopmund', 'Oshakati', 'Rehoboth', 'Katima Mulilo', 'Otjiwarongo', 'Okahandja', 'Gobabis'],
  LS: ['Maseru', 'Teyateyaneng', 'Mafeteng', 'Hlotse', 'Maputsoe', "Mohale's Hoek", 'Quthing', "Qacha's Nek", 'Butha-Buthe', 'Mokhotlong'],
  SZ: ['Mbabane', 'Manzini', 'Big Bend', 'Malkerns', 'Nhlangano', 'Piggs Peak', 'Siteki', 'Hlatikulu', 'Lobamba', 'Simunye'],
  UG: ['Kampala', 'Nansana', 'Kira', 'Ssabagabo', 'Mbarara', 'Mukono', 'Gulu', 'Lira', 'Mbale', 'Jinja', 'Kasese', 'Masaka'],
  RW: ['Kigali', 'Butare', 'Gitarama', 'Ruhengeri', 'Gisenyi', 'Byumba', 'Cyangugu', 'Kibungo', 'Kibuye', 'Nyanza'],
  BI: ['Bujumbura', 'Gitega', 'Muyinga', 'Ruyigi', 'Ngozi', 'Kayanza', 'Rumonge', 'Bururi', 'Cibitoke', 'Muramvya'],
  ER: ['Asmara', 'Keren', 'Massawa', 'Assab', 'Mendefera', 'Barentu', 'Adi Keyh', 'Dekemhare', 'Ghinda', 'Nakfa'],
  DJ: ['Djibouti City', 'Ali Sabieh', 'Tadjourah', 'Obock', 'Dikhil', 'Arta', 'Holhol', 'Yoboki', 'Balho', 'Randa'],
  SO: ['Mogadishu', 'Hargeisa', 'Bosaso', 'Kismayo', 'Merca', 'Berbera', 'Baidoa', 'Galkayo', 'Jowhar', 'Beledweyne'],
  BF: ['Ouagadougou', 'Bobo-Dioulasso', 'Koudougou', 'Ouahigouya', 'Banfora', 'Kaya', 'Tenkodogo', "Fada N'Gourma", 'Dédougou', 'Houndé'],
  CV: ['Praia', 'Mindelo', 'Santa Maria', 'Espargos', 'Assomada', 'Pedra Badejo', 'Tarrafal', 'Porto Novo', 'São Filipe', 'Sal Rei'],
  ST: ['São Tomé', 'Santo António', 'Neves', 'Santana', 'Trindade', 'Guadalupe', 'Santo Amaro', 'São João dos Angolares', 'Porto Alegre', 'Pantufo'],
  SC: ['Victoria', 'Anse Boileau', 'Beau Vallon', 'Anse Royale', 'Takamaka', 'Cascade', 'Grand Anse', 'Bel Ombre', 'Port Glaud', 'Baie Lazare'],
  MU: ['Port Louis', 'Beau Bassin-Rose Hill', 'Vacoas-Phoenix', 'Curepipe', 'Quatre Bornes', 'Triolet', 'Goodlands', 'Centre de Flacq', 'Bel Air', 'Mahébourg'],
  MG: ['Antananarivo', 'Toamasina', 'Antsirabe', 'Fianarantsoa', 'Mahajanga', 'Toliara', 'Antsiranana', 'Ambovombe', 'Morondava', 'Ambatondrazaka'],
  KM: ['Moroni', 'Mutsamudu', 'Fomboni', 'Domoni', 'Tsimbeo', 'Mitsamiouli', 'Ouani', 'Sima', 'Mramani', 'Foumbouni'],

  // Europe (remaining)
  LU: ['Luxembourg City', 'Esch-sur-Alzette', 'Differdange', 'Dudelange', 'Ettelbruck', 'Diekirch', 'Wiltz', 'Echternach', 'Rumelange', 'Grevenmacher'],
  NO: [
    'Oslo', 'Bergen', 'Trondheim', 'Stavanger', 'Drammen', 'Fredrikstad', 'Kristiansand', 'Sandnes', 'Tromsø', 'Sarpsborg',
    'Skien', 'Ålesund', 'Bodø', 'Sandefjord', 'Haugesund',
  ],
  FI: [
    'Helsinki', 'Espoo', 'Tampere', 'Vantaa', 'Oulu', 'Turku', 'Jyväskylä', 'Lahti', 'Kuopio', 'Pori',
    'Kouvola', 'Joensuu', 'Lappeenranta', 'Vaasa', 'Rovaniemi',
  ],
  IS: ['Reykjavík', 'Kópavogur', 'Hafnarfjörður', 'Akureyri', 'Reykjanesbær', 'Garðabær', 'Mosfellsbær', 'Árborg', 'Akranes', 'Fjarðabyggð'],
  CZ: [
    'Prague', 'Brno', 'Ostrava', 'Plzeň', 'Liberec', 'Olomouc', 'Ústí nad Labem', 'České Budějovice', 'Hradec Králové', 'Pardubice',
    'Zlín', 'Havířov', 'Kladno', 'Most',
  ],
  SK: ['Bratislava', 'Košice', 'Prešov', 'Žilina', 'Nitra', 'Banská Bystrica', 'Trnava', 'Martin', 'Trenčín', 'Poprad'],
  HU: ['Budapest', 'Debrecen', 'Szeged', 'Miskolc', 'Pécs', 'Győr', 'Nyíregyháza', 'Kecskemét', 'Székesfehérvár', 'Szombathely'],
  RO: [
    'Bucharest', 'Cluj-Napoca', 'Timișoara', 'Iași', 'Constanța', 'Craiova', 'Brașov', 'Galați', 'Ploiești', 'Oradea',
    'Brăila', 'Arad', 'Sibiu', 'Bacău',
  ],
  BG: ['Sofia', 'Plovdiv', 'Varna', 'Burgas', 'Ruse', 'Stara Zagora', 'Pleven', 'Sliven', 'Dobrich', 'Shumen'],
  HR: ['Zagreb', 'Split', 'Rijeka', 'Osijek', 'Zadar', 'Slavonski Brod', 'Pula', 'Karlovac', 'Sisak', 'Varaždin'],
  SI: ['Ljubljana', 'Maribor', 'Celje', 'Kranj', 'Velenje', 'Koper', 'Novo Mesto', 'Ptuj', 'Trbovlje', 'Kamnik'],
  RS: ['Belgrade', 'Novi Sad', 'Niš', 'Kragujevac', 'Subotica', 'Zrenjanin', 'Pančevo', 'Čačak', 'Kruševac', 'Kraljevo'],
  BA: ['Sarajevo', 'Banja Luka', 'Tuzla', 'Zenica', 'Mostar', 'Bijeljina', 'Brčko', 'Prijedor', 'Trebinje', 'Doboj'],
  ME: ['Podgorica', 'Nikšić', 'Herceg Novi', 'Pljevlja', 'Bijelo Polje', 'Cetinje', 'Bar', 'Budva', 'Kotor', 'Berane'],
  MK: ['Skopje', 'Bitola', 'Kumanovo', 'Prilep', 'Tetovo', 'Veles', 'Štip', 'Ohrid', 'Gostivar', 'Strumica'],
  AL: ['Tirana', 'Durrës', 'Vlorë', 'Elbasan', 'Shkodër', 'Fier', 'Korçë', 'Berat', 'Lushnjë', 'Kavajë'],
  XK: ['Pristina', 'Prizren', 'Ferizaj', 'Peja', 'Gjakova', 'Gjilan', 'Mitrovica', 'Podujeva', 'Vushtrri', 'Suhareka'],
  LT: ['Vilnius', 'Kaunas', 'Klaipėda', 'Šiauliai', 'Panevėžys', 'Alytus', 'Marijampolė', 'Mažeikiai', 'Jonava', 'Utena'],
  LV: ['Riga', 'Daugavpils', 'Liepāja', 'Jelgava', 'Jūrmala', 'Ventspils', 'Rēzekne', 'Valmiera', 'Jēkabpils', 'Ogre'],
  EE: ['Tallinn', 'Tartu', 'Narva', 'Pärnu', 'Kohtla-Järve', 'Viljandi', 'Rakvere', 'Maardu', 'Kuressaare', 'Sillamäe'],
  MD: ['Chișinău', 'Tiraspol', 'Bălți', 'Bender', 'Rîbnița', 'Cahul', 'Ungheni', 'Soroca', 'Orhei', 'Comrat'],
  UA: [
    'Kyiv', 'Kharkiv', 'Odesa', 'Dnipro', 'Donetsk', 'Zaporizhzhia', 'Lviv', 'Kryvyi Rih', 'Mykolaiv', 'Mariupol',
    'Vinnytsia', 'Chernihiv',
  ],
  BY: ['Minsk', 'Gomel', 'Mogilev', 'Vitebsk', 'Grodno', 'Brest', 'Babruysk', 'Baranovichi', 'Borisov', 'Pinsk'],
  RU: [
    'Moscow', 'Saint Petersburg', 'Novosibirsk', 'Yekaterinburg', 'Kazan', 'Nizhny Novgorod', 'Chelyabinsk', 'Samara', 'Omsk', 'Rostov-on-Don',
    'Ufa', 'Krasnoyarsk', 'Voronezh', 'Perm', 'Volgograd',
  ],
  MT: ['Valletta', 'Birkirkara', 'Mosta', 'Qormi', 'Żabbar', 'San Pawl il-Baħar', 'Sliema', 'Żejtun', 'Fgura', 'Rabat'],
  CY: ['Nicosia', 'Limassol', 'Larnaca', 'Famagusta', 'Paphos', 'Kyrenia', 'Paralimni', 'Aradippou', 'Strovolos', 'Lakatamia'],
  AD: ['Andorra la Vella', 'Escaldes-Engordany', 'Encamp', 'Sant Julià de Lòria', 'La Massana', 'Santa Coloma', 'Ordino', 'Canillo', 'Pas de la Casa', 'Arinsal'],
  MC: ['Monaco-Ville', 'Monte Carlo', 'La Condamine', 'Fontvieille', 'Moneghetti', 'Larvotto', 'Saint Roman', 'La Rousse', 'Les Révoires', 'Le Portier'],
  LI: ['Vaduz', 'Schaan', 'Triesen', 'Balzers', 'Eschen', 'Mauren', 'Triesenberg', 'Ruggell', 'Gamprin', 'Schellenberg'],
  SM: ['San Marino City', 'Serravalle', 'Borgo Maggiore', 'Domagnano', 'Fiorentino', 'Acquaviva', 'Faetano', 'Montegiardino', 'Chiesanuova', 'San Giovanni'],
  VA: ['Vatican City'],

  // Asia (incl. Middle East)
  TR: [
    'Istanbul', 'Ankara', 'Izmir', 'Bursa', 'Antalya', 'Adana', 'Konya', 'Gaziantep', 'Şanlıurfa', 'Kayseri',
    'Mersin', 'Eskişehir', 'Diyarbakır', 'Samsun', 'Denizli',
  ],
  IL: ['Jerusalem', 'Tel Aviv', 'Haifa', 'Rishon LeZion', 'Petah Tikva', 'Ashdod', 'Netanya', 'Beersheba', 'Bnei Brak', 'Holon'],
  PS: ['Gaza', 'Ramallah', 'Hebron', 'Nablus', 'Bethlehem', 'Khan Yunis', 'Jenin', 'Rafah', 'Tulkarm', 'Qalqilya'],
  JO: ['Amman', 'Zarqa', 'Irbid', 'Russeifa', 'Aqaba', 'Salt', 'Madaba', 'Mafraq', 'Karak', 'Jerash'],
  LB: ['Beirut', 'Tripoli', 'Sidon', 'Tyre', 'Zahlé', 'Baalbek', 'Byblos', 'Jounieh', 'Batroun', 'Nabatieh'],
  SY: ['Damascus', 'Aleppo', 'Homs', 'Latakia', 'Hama', 'Deir ez-Zor', 'Raqqa', 'Daraa', 'Tartus', 'Idlib'],
  IQ: ['Baghdad', 'Basra', 'Mosul', 'Erbil', 'Najaf', 'Karbala', 'Kirkuk', 'Sulaymaniyah', 'Nasiriyah', 'Amara'],
  SA: [
    'Riyadh', 'Jeddah', 'Mecca', 'Medina', 'Dammam', 'Khobar', 'Taif', 'Tabuk', 'Buraidah', 'Khamis Mushait',
    'Hail', 'Najran',
  ],
  YE: ['Sanaa', 'Aden', 'Taiz', 'Hodeidah', 'Ibb', 'Mukalla', 'Dhamar', 'Amran', 'Sayyan', 'Zinjibar'],
  OM: ['Muscat', 'Seeb', 'Salalah', 'Bawshar', 'Sohar', 'Sur', 'Nizwa', 'Ibri', 'Rustaq', 'Buraimi'],
  AE: ['Dubai', 'Abu Dhabi', 'Sharjah', 'Al Ain', 'Ajman', 'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain', 'Khor Fakkan', 'Kalba'],
  QA: ['Doha', 'Al Rayyan', 'Al Wakrah', 'Al Khor', 'Umm Salal', 'Al Shamal', 'Mesaieed', 'Dukhan', 'Al Daayen', 'Lusail'],
  BH: ["Manama", 'Riffa', 'Muharraq', 'Hamad Town', "A'ali", 'Isa Town', 'Sitra', 'Budaiya', 'Jidhafs', 'Al Malikiyah'],
  KW: [
    'Kuwait City', 'Al Ahmadi', 'Hawalli', 'As Salimiyah', 'Sabah as Salim', 'Al Farwaniyah', 'Al Jahra', 'Al Fintas', 'Al Fahahil', 'Mangaf',
  ],
  IR: ['Tehran', 'Mashhad', 'Isfahan', 'Karaj', 'Shiraz', 'Tabriz', 'Qom', 'Ahvaz', 'Kermanshah', 'Urmia', 'Rasht', 'Zahedan'],
  AF: ['Kabul', 'Kandahar', 'Herat', 'Mazar-i-Sharif', 'Kunduz', 'Jalalabad', 'Lashkar Gah', 'Taloqan', 'Puli Khumri', 'Ghazni'],
  PK: [
    'Karachi', 'Lahore', 'Faisalabad', 'Rawalpindi', 'Multan', 'Hyderabad', 'Gujranwala', 'Peshawar', 'Islamabad', 'Quetta',
    'Sialkot', 'Bahawalpur',
  ],
  IN: [
    'Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Ahmedabad', 'Chennai', 'Kolkata', 'Surat', 'Pune', 'Jaipur',
    'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Bhopal', 'Patna', 'Vadodara', 'Ghaziabad',
  ],
  BD: ['Dhaka', 'Chittagong', 'Khulna', 'Rajshahi', 'Sylhet', 'Comilla', 'Rangpur', 'Mymensingh', 'Barisal', 'Gazipur'],
  LK: ['Colombo', 'Dehiwala-Mount Lavinia', 'Kandy', 'Galle', 'Jaffna', 'Negombo', 'Trincomalee', 'Batticaloa', 'Anuradhapura', 'Matara'],
  NP: ['Kathmandu', 'Pokhara', 'Lalitpur', 'Biratnagar', 'Bharatpur', 'Birgunj', 'Dharan', 'Butwal', 'Hetauda', 'Janakpur'],
  BT: ['Thimphu', 'Phuntsholing', 'Punakha', 'Paro', 'Gelephu', 'Samdrup Jongkhar', 'Wangdue Phodrang', 'Trashigang', 'Jakar', 'Trongsa'],
  MM: ['Yangon', 'Mandalay', 'Naypyidaw', 'Mawlamyine', 'Bago', 'Pathein', 'Monywa', 'Meiktila', 'Myitkyina', 'Taunggyi'],
  TH: [
    'Bangkok', 'Nonthaburi', 'Nakhon Ratchasima', 'Chiang Mai', 'Hat Yai', 'Udon Thani', 'Pak Kret', 'Khon Kaen', 'Rayong', 'Surat Thani',
  ],
  LA: ['Vientiane', 'Pakse', 'Savannakhet', 'Luang Prabang', 'Xam Neua', 'Thakhek', 'Muang Xay', 'Vang Vieng', 'Attapeu', 'Phonsavan'],
  KH: ['Phnom Penh', 'Siem Reap', 'Battambang', 'Sihanoukville', 'Poipet', 'Kampong Cham', 'Ta Khmau', 'Pursat', 'Kampot', 'Kratie'],
  VN: [
    'Ho Chi Minh City', 'Hanoi', 'Da Nang', 'Hai Phong', 'Can Tho', 'Bien Hoa', 'Hue', 'Nha Trang', 'Buon Ma Thuot', 'Vung Tau',
  ],
  MY: ['Kuala Lumpur', 'George Town', 'Ipoh', 'Shah Alam', 'Petaling Jaya', 'Johor Bahru', 'Malacca City', 'Kota Kinabalu', 'Kuching', 'Seremban'],
  SG: ['Singapore', 'Jurong West', 'Woodlands', 'Tampines', 'Sengkang', 'Hougang', 'Yishun', 'Bedok', 'Punggol', 'Ang Mo Kio'],
  ID: [
    'Jakarta', 'Surabaya', 'Bandung', 'Medan', 'Semarang', 'Makassar', 'Palembang', 'Depok', 'Tangerang', 'Bekasi',
    'Bogor', 'Batam', 'Denpasar', 'Yogyakarta',
  ],
  PH: [
    'Manila', 'Quezon City', 'Davao City', 'Caloocan', 'Cebu City', 'Zamboanga City', 'Taguig', 'Antipolo', 'Pasig', 'Cagayan de Oro',
  ],
  BN: ['Bandar Seri Begawan', 'Kuala Belait', 'Seria', 'Tutong', 'Bangar', 'Muara', 'Jerudong', 'Lumut', 'Sengkurong', 'Tanjong Bunut'],
  TL: ['Dili', 'Baucau', 'Maliana', 'Suai', 'Liquiçá', 'Aileu', 'Ainaro', 'Same', 'Los Palos', 'Viqueque'],
  CN: [
    'Shanghai', 'Beijing', 'Chongqing', 'Guangzhou', 'Shenzhen', 'Chengdu', 'Tianjin', 'Wuhan', "Xi'an", 'Hangzhou',
    'Nanjing', 'Shenyang', 'Qingdao', 'Dalian', 'Zhengzhou', 'Harbin', 'Kunming', 'Xiamen',
  ],
  JP: [
    'Tokyo', 'Yokohama', 'Osaka', 'Nagoya', 'Sapporo', 'Fukuoka', 'Kobe', 'Kyoto', 'Kawasaki', 'Saitama',
    'Hiroshima', 'Sendai', 'Chiba', 'Kitakyushu',
  ],
  KR: ['Seoul', 'Busan', 'Incheon', 'Daegu', 'Daejeon', 'Gwangju', 'Suwon', 'Ulsan', 'Changwon', 'Goyang'],
  KP: ['Pyongyang', 'Hamhung', 'Chongjin', 'Nampo', 'Wonsan', 'Sinuiju', 'Tanchon', 'Kaesong', 'Sariwon', 'Hyesan'],
  MN: ['Ulaanbaatar', 'Erdenet', 'Darkhan', 'Choibalsan', 'Mörön', 'Nalaikh', 'Khovd', 'Ölgii', 'Baganuur', 'Sükhbaatar'],
  TW: ['Taipei', 'Kaohsiung', 'Taichung', 'Tainan', 'Taoyuan', 'Hsinchu', 'Keelung', 'Chiayi', 'Changhua', 'Yunlin'],
  HK: ['Hong Kong Island', 'Kowloon', 'Tsuen Wan', 'Sha Tin', 'Tuen Mun', 'Yuen Long', 'Tai Po', 'Sai Kung', 'North Point', 'Kwun Tong'],
  MO: ['Macau', 'Taipa', 'Coloane', 'Cotai'],
  KZ: ['Almaty', 'Astana', 'Shymkent', 'Karaganda', 'Aktobe', 'Taraz', 'Pavlodar', 'Ust-Kamenogorsk', 'Semey', 'Atyrau'],
  UZ: ['Tashkent', 'Namangan', 'Samarkand', 'Andijan', 'Nukus', 'Bukhara', 'Qarshi', 'Fergana', 'Jizzakh', 'Termez'],
  TM: ['Ashgabat', 'Türkmenabat', 'Daşoguz', 'Mary', 'Balkanabat', 'Bayramaly', 'Tejen', 'Serdar', 'Abadan', 'Baýramaly'],
  TJ: ['Dushanbe', 'Khujand', 'Kulob', 'Bokhtar', 'Istaravshan', 'Konibodom', 'Tursunzoda', 'Panjakent', 'Vahdat', 'Isfara'],
  KG: ['Bishkek', 'Osh', 'Jalal-Abad', 'Karakol', 'Tokmok', 'Kara-Balta', 'Naryn', 'Talas', 'Batken', 'Uzgen'],
  AM: ['Yerevan', 'Gyumri', 'Vanadzor', 'Vagharshapat', 'Abovyan', 'Kapan', 'Hrazdan', 'Armavir', 'Artashat', 'Ijevan'],
  AZ: ['Baku', 'Ganja', 'Sumqayit', 'Mingachevir', 'Lankaran', 'Shirvan', 'Nakhchivan', 'Shaki', 'Yevlakh', 'Khankendi'],
  GE: ['Tbilisi', 'Batumi', 'Kutaisi', 'Rustavi', 'Zugdidi', 'Gori', 'Poti', 'Samtredia', 'Khashuri', 'Senaki'],
  MV: ['Malé', 'Addu City', 'Fuvahmulah', 'Kulhudhuffushi', 'Thinadhoo', 'Naifaru', 'Hithadhoo', 'Dhidhdhoo', 'Eydhafushi', 'Funadhoo'],

  // North America (incl. Central America & Caribbean)
  US: [
    'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose',
    'Austin', 'Jacksonville', 'San Francisco', 'Columbus', 'Charlotte', 'Indianapolis', 'Seattle', 'Denver', 'Washington', 'Boston',
    'Miami', 'Atlanta', 'Las Vegas', 'Detroit', 'Portland',
  ],
  CA: [
    'Toronto', 'Montreal', 'Vancouver', 'Calgary', 'Edmonton', 'Ottawa', 'Winnipeg', 'Quebec City', 'Hamilton', 'Kitchener',
    'London', 'Victoria', 'Halifax', 'Saskatoon', 'Regina',
  ],
  MX: [
    'Mexico City', 'Guadalajara', 'Monterrey', 'Puebla', 'Tijuana', 'León', 'Juárez', 'Zapopan', 'Mérida', 'Cancún',
    'Querétaro', 'Chihuahua', 'San Luis Potosí', 'Acapulco',
  ],
  GT: ['Guatemala City', 'Mixco', 'Villa Nueva', 'Quetzaltenango', 'Escuintla', 'Chinautla', 'Chimaltenango', 'Huehuetenango', 'Antigua Guatemala', 'Cobán'],
  BZ: ['Belize City', 'San Ignacio', 'Orange Walk', 'Belmopan', 'Dangriga', 'Corozal', 'San Pedro', 'Benque Viejo', 'Punta Gorda', 'Placencia'],
  SV: ['San Salvador', 'Santa Ana', 'San Miguel', 'Soyapango', 'Mejicanos', 'Santa Tecla', 'Apopa', 'Delgado', 'Sonsonate', 'Ahuachapán'],
  HN: ['Tegucigalpa', 'San Pedro Sula', 'Choloma', 'La Ceiba', 'El Progreso', 'Choluteca', 'Comayagua', 'Puerto Cortés', 'Danlí', 'Siguatepeque'],
  NI: ['Managua', 'León', 'Masaya', 'Chinandega', 'Matagalpa', 'Granada', 'Estelí', 'Tipitapa', 'Jinotega', 'Juigalpa'],
  CR: ['San José', 'Alajuela', 'Cartago', 'Heredia', 'Liberia', 'Puntarenas', 'Limón', 'Desamparados', 'San Isidro', 'Pérez Zeledón'],
  PA: ['Panama City', 'San Miguelito', 'Tocumen', 'David', 'Arraiján', 'Colón', 'La Chorrera', 'Santiago', 'Chitré', 'Penonomé'],
  CU: ['Havana', 'Santiago de Cuba', 'Camagüey', 'Holguín', 'Guantánamo', 'Santa Clara', 'Bayamo', 'Cienfuegos', 'Pinar del Río', 'Matanzas'],
  JM: ['Kingston', 'Spanish Town', 'Portmore', 'Montego Bay', 'May Pen', 'Mandeville', 'Old Harbour', 'Savanna-la-Mar', 'Ocho Rios', 'Port Antonio'],
  HT: ['Port-au-Prince', 'Cap-Haïtien', 'Carrefour', 'Delmas', 'Pétion-Ville', 'Gonaïves', 'Croix-des-Bouquets', 'Les Cayes', 'Jacmel', 'Léogâne'],
  DO: [
    'Santo Domingo', 'Santiago de los Caballeros', 'Santo Domingo Este', 'La Romana', 'San Pedro de Macorís', 'San Cristóbal', 'Puerto Plata', 'La Vega', 'Higüey', 'Moca',
  ],
  BS: ['Nassau', 'Freeport', 'West End', 'Coopers Town', 'Marsh Harbour', 'Freetown', 'High Rock', 'Andros Town', 'George Town', 'Alice Town'],
  BB: ['Bridgetown', 'Speightstown', 'Oistins', 'Bathsheba', 'Holetown', 'Crane', 'Six Roads', 'Bayville', 'Blackmans', 'Checker Hall'],
  TT: ['Port of Spain', 'San Fernando', 'Chaguanas', 'Arima', 'Point Fortin', 'Scarborough', 'Sangre Grande', 'Couva', 'Princes Town', 'Tunapuna'],
  GD: ["St. George's", 'Gouyave', 'Grenville', 'Victoria', 'Sauteurs', 'Hillsborough', 'Grand Roy', 'Birch Grove', 'Marquis', 'Tivoli'],
  LC: ['Castries', 'Bisée', 'Vieux Fort', 'Micoud', 'Soufrière', 'Dennery', 'Gros Islet', 'Anse la Raye', 'Choiseul', 'Laborie'],
  VC: ['Kingstown', 'Georgetown', 'Byera', 'Chateaubelair', 'Barrouallie', 'Layou', 'Biabou', 'Calliaqua', 'Port Elizabeth', 'Union Island'],
  AG: ["St. John's", 'All Saints', 'Liberta', 'Potters Village', 'Bolans', 'Swetes', 'Parham', 'Falmouth', 'Codrington', 'Piggotts'],
  DM: ['Roseau', 'Portsmouth', 'Marigot', 'Berekua', 'Mahaut', 'Wesley', 'Salisbury', 'Soufrière', 'Grand Bay', 'Castle Bruce'],
  KN: ['Basseterre', 'Charlestown', 'Sandy Point Town', 'Cayon', 'Dieppe Bay Town', 'Fig Tree', 'Newcastle', 'Old Road Town', 'Tabernacle', 'Gingerland'],

  // South America
  BR: [
    'São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador', 'Fortaleza', 'Belo Horizonte', 'Manaus', 'Curitiba', 'Recife', 'Porto Alegre',
    'Belém', 'Goiânia', 'Guarulhos', 'Campinas', 'São Luís',
  ],
  AR: [
    'Buenos Aires', 'Córdoba', 'Rosario', 'Mendoza', 'La Plata', 'San Miguel de Tucumán', 'Mar del Plata', 'Salta', 'Santa Fe', 'San Juan',
    'Resistencia', 'Neuquén',
  ],
  CL: [
    'Santiago', 'Valparaíso', 'Concepción', 'La Serena', 'Antofagasta', 'Temuco', 'Rancagua', 'Talca', 'Arica', 'Iquique',
    'Puerto Montt', 'Chillán',
  ],
  CO: [
    'Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena', 'Cúcuta', 'Bucaramanga', 'Pereira', 'Santa Marta', 'Ibagué',
    'Manizales', 'Villavicencio',
  ],
  PE: ['Lima', 'Arequipa', 'Trujillo', 'Chiclayo', 'Piura', 'Iquitos', 'Cusco', 'Chimbote', 'Huancayo', 'Tacna'],
  VE: ['Caracas', 'Maracaibo', 'Valencia', 'Barquisimeto', 'Maracay', 'Ciudad Guayana', 'San Cristóbal', 'Maturín', 'Barcelona', 'Puerto La Cruz'],
  EC: ['Guayaquil', 'Quito', 'Cuenca', 'Santo Domingo', 'Machala', 'Durán', 'Manta', 'Portoviejo', 'Loja', 'Ambato'],
  BO: ['Santa Cruz de la Sierra', 'La Paz', 'El Alto', 'Cochabamba', 'Sucre', 'Oruro', 'Tarija', 'Potosí', 'Sacaba', 'Montero'],
  PY: ['Asunción', 'Ciudad del Este', 'San Lorenzo', 'Luque', 'Capiatá', 'Lambaré', 'Fernando de la Mora', 'Limpio', 'Ñemby', 'Encarnación'],
  UY: ['Montevideo', 'Salto', 'Ciudad de la Costa', 'Paysandú', 'Las Piedras', 'Rivera', 'Maldonado', 'Tacuarembó', 'Melo', 'Mercedes'],
  GY: ['Georgetown', 'Linden', 'New Amsterdam', 'Anna Regina', 'Bartica', 'Skeldon', 'Rosignol', 'Mahaica', 'Corriverton', 'Parika'],
  SR: ['Paramaribo', 'Lelydorp', 'Nieuw Nickerie', 'Moengo', 'Nieuw Amsterdam', 'Mariënburg', 'Wageningen', 'Albina', 'Groningen', 'Brokopondo'],

  // Oceania
  AU: [
    'Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Gold Coast', 'Newcastle', 'Canberra', 'Wollongong', 'Hobart',
    'Geelong', 'Townsville', 'Cairns', 'Darwin',
  ],
  NZ: ['Auckland', 'Wellington', 'Christchurch', 'Hamilton', 'Tauranga', 'Napier-Hastings', 'Dunedin', 'Palmerston North', 'Nelson', 'Rotorua'],
  FJ: ['Suva', 'Nadi', 'Lautoka', 'Labasa', 'Nausori', 'Ba', 'Sigatoka', 'Levuka', 'Rakiraki', 'Savusavu'],
  PG: ['Port Moresby', 'Lae', 'Mount Hagen', 'Popondetta', 'Madang', 'Wewak', 'Goroka', 'Kokopo', 'Kimbe', 'Mendi'],
  SB: ['Honiara', 'Auki', 'Gizo', 'Buala', 'Kirakira', 'Tulagi', 'Lata', 'Buin', 'Munda', 'Taro'],
  VU: ['Port Vila', 'Luganville', 'Norsup', 'Isangel', 'Sola', 'Lakatoro', 'Saratamata', 'Longana', 'Lenakel', 'Ambae'],
  WS: ['Apia', 'Vaitele', 'Faleula', 'Siusega', 'Malie', 'Vailoa', 'Lalovaea', 'Nofoalii', "Leauva'a", "Fasito'outa"],
  TO: ["Nuku'alofa", 'Neiafu', 'Haveluloto', 'Vaini', 'Pangai', "'Ohonua", 'Kolonga', 'Tofoa', 'Longoteme', 'Houma'],
};
