import { describe, it, expect } from 'vitest';
import { cityLabel, MOROCCO_CITIES } from './listing.model';
import { CITY_LABELS } from './city-names';
import { CITIES_BY_COUNTRY } from './country.model';

describe('cityLabel', () => {
  it('shows well-known foreign cities in the app language', () => {
    expect(cityLabel('Munich', 'de')).toBe('München');
    expect(cityLabel('Cologne', 'de')).toBe('Köln');
    expect(cityLabel('Vienna', 'de')).toBe('Wien');
    expect(cityLabel('Zurich', 'de')).toBe('Zürich');
    expect(cityLabel('Munich', 'fr')).toBe('Munich');
    expect(cityLabel('Rome', 'fr')).toBe('Rome');
    expect(cityLabel('Rome', 'it')).toBe('Roma');
    expect(cityLabel('Cologne', 'es')).toBe('Colonia');
    expect(cityLabel('Vienna', 'ar')).toBe('فيينا');
  });

  it('keeps the stored name for English, unknown languages and unknown cities', () => {
    expect(cityLabel('Munich', 'en')).toBe('Munich');
    expect(cityLabel('Munich', 'pt')).toBe('Munich');
    expect(cityLabel('Kleinkleckersdorf', 'de')).toBe('Kleinkleckersdorf');
    expect(cityLabel('', 'de')).toBe('');
  });

  it('still uses the existing Arabic names for Moroccan cities', () => {
    expect(cityLabel('Rabat', 'ar')).toBe('الرباط');
  });

  it('has no invisible characters or empty labels in the dictionary', () => {
    for (const [lang, labels] of Object.entries(CITY_LABELS)) {
      for (const [city, label] of Object.entries(labels)) {
        expect(label.trim(), `${lang}/${city}`).toBe(label);
        expect(/[​-‏﻿]/.test(label), `${lang}/${city} has an invisible character`).toBe(false);
        expect(label.length).toBeGreaterThan(0);
      }
    }
  });

  it('only translates cities that exist in a curated list or in Morocco', () => {
    const known = new Set([...Object.values(CITIES_BY_COUNTRY).flat(), ...MOROCCO_CITIES]);
    for (const lang of Object.keys(CITY_LABELS)) {
      const unknown = Object.keys(CITY_LABELS[lang]).filter((c) => !known.has(c));
      expect(unknown, lang).toEqual([]);
    }
  });
});
