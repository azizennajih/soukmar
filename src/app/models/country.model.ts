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

export function currencyForCountry(code: string): string {
  return BY_CODE.get(code)?.currency ?? 'USD';
}

export function isKnownCountry(code: string): boolean {
  return BY_CODE.has(code);
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
};
