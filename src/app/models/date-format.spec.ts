import { describe, it, expect } from 'vitest';
import { dateFormatForCountry, formatDateForCountry } from './date-format';

describe('country date format', () => {
  const d = new Date(2026, 11, 5); // 5 Dec 2026

  it('writes Germany day.month.year', () => {
    expect(dateFormatForCountry('DE')).toEqual({ order: ['day', 'month', 'year'], separator: '.' });
    expect(formatDateForCountry(d, 'DE')).toBe('05.12.2026');
  });

  it('reads a plain YYYY-MM-DD as that calendar day', () => {
    expect(formatDateForCountry('2026-12-05', 'DE')).toBe('05.12.2026');
  });

  it('writes the USA month/day/year', () => {
    expect(formatDateForCountry(d, 'US')).toBe('12/05/2026');
  });

  it('writes Morocco and France day/month/year', () => {
    expect(formatDateForCountry(d, 'MA')).toBe('05/12/2026');
    expect(formatDateForCountry(d, 'FR')).toBe('05/12/2026');
  });

  it('writes Japan year/month/day', () => {
    expect(dateFormatForCountry('JP').order).toEqual(['year', 'month', 'day']);
  });

  it('drops the year for short timestamps and survives unknown input', () => {
    expect(formatDateForCountry(d, 'DE', false)).toBe('05.12');
    expect(formatDateForCountry('not a date', 'DE')).toBe('');
    expect(dateFormatForCountry('ZZ').order).toHaveLength(3);
    expect(dateFormatForCountry(undefined).order).toEqual(['day', 'month', 'year']);
  });
});
