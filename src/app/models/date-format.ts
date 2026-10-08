/** How a country writes a numeric date: the order of day/month/year and the separator (DE 31.12.2026, US 12/31/2026, JP 2026/12/31). */
export interface DateFormat {
  order: ('day' | 'month' | 'year')[];
  separator: string;
}

const DEFAULT_FORMAT: DateFormat = { order: ['day', 'month', 'year'], separator: '/' };
const cache = new Map<string, DateFormat>();

/** The country's own date convention, read from the platform's locale data (CLDR) — no table to maintain. */
export function dateFormatForCountry(country: string | null | undefined): DateFormat {
  const cc = (country ?? '').toUpperCase();
  if (!/^[A-Z]{2}$/.test(cc)) return DEFAULT_FORMAT;
  const cached = cache.get(cc);
  if (cached) return cached;
  let format = DEFAULT_FORMAT;
  try {
    const locale = new Intl.Locale('und-' + cc).maximize().toString();
    const parts = new Intl.DateTimeFormat(locale, {
      day: '2-digit', month: '2-digit', year: 'numeric', calendar: 'gregory', numberingSystem: 'latn',
    }).formatToParts(new Date(2000, 10, 22));
    const order = parts
      .filter(p => p.type === 'day' || p.type === 'month' || p.type === 'year')
      .map(p => p.type as 'day' | 'month' | 'year');
    const firstLiteral = parts.find(p => p.type === 'literal')?.value.match(/[./-]/)?.[0];
    if (order.length === 3) format = { order, separator: firstLiteral ?? '/' };
  } catch { /* unknown region: keep the default */ }
  cache.set(cc, format);
  return format;
}

/** Numeric date plus the time (24 h) — for "when exactly did this happen" lists. */
export function formatDateTimeForCountry(value: Date | string | number, country: string | null | undefined): string {
  const d = value instanceof Date ? value : new Date(value);
  const day = formatDateForCountry(d, country);
  if (!day) return '';
  const two = (n: number) => String(n).padStart(2, '0');
  return `${day} ${two(d.getHours())}:${two(d.getMinutes())}`;
}

/** Formats a date numerically the way the country writes it. Without a year (chat timestamps) the trailing separator stays out. */
export function formatDateForCountry(value: Date | string | number, country: string | null | undefined, withYear = true): string {
  // A plain 'YYYY-MM-DD' (date fields) is a calendar day, not a UTC instant: read it as local so no timezone can shift it.
  const iso = typeof value === 'string' ? /^(d{4})-(d{2})-(d{2})$/.exec(value) : null;
  const d = value instanceof Date ? value : iso ? new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3])) : new Date(value);
  if (isNaN(d.getTime())) return '';
  const { order, separator } = dateFormatForCountry(country);
  const two = (n: number) => String(n).padStart(2, '0');
  const part = { day: two(d.getDate()), month: two(d.getMonth() + 1), year: String(d.getFullYear()) };
  const used = withYear ? order : order.filter(o => o !== 'year');
  return used.map(o => part[o]).join(separator);
}
