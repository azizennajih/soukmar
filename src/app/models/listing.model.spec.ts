import { MOROCCO_CITIES, formatPrice, formatPriceParts, isNewListing, timeAgo } from './listing.model';

describe('MOROCCO_CITIES', () => {
  // Locks in a real fix: the list had 39 exact-duplicate city names (356 ->
  // 317 unique), confirmed by an Angular NG0955 duplicate-track-key warning
  // in every dropdown built from this list.
  it('has no duplicate entries', () => {
    const seen = new Set<string>();
    const duplicates: string[] = [];
    for (const city of MOROCCO_CITIES) {
      if (seen.has(city)) duplicates.push(city);
      seen.add(city);
    }
    expect(duplicates).toEqual([]);
  });

  it('is non-empty and sorted', () => {
    expect(MOROCCO_CITIES.length).toBeGreaterThan(100);
    const sorted = [...MOROCCO_CITIES].sort();
    expect(MOROCCO_CITIES).toEqual(sorted);
  });
});

describe('isNewListing', () => {
  it('is true for a listing created seconds ago', () => {
    expect(isNewListing(new Date())).toBe(true);
  });

  it('is true just under the 24h threshold', () => {
    const date = new Date(Date.now() - 23 * 3600 * 1000);
    expect(isNewListing(date)).toBe(true);
  });

  it('is false once past the 24h threshold', () => {
    const date = new Date(Date.now() - 25 * 3600 * 1000);
    expect(isNewListing(date)).toBe(false);
  });

  it('is false for a future date (clock skew safety)', () => {
    const date = new Date(Date.now() + 3600 * 1000);
    expect(isNewListing(date)).toBe(false);
  });

  it('respects a custom hours window', () => {
    const date = new Date(Date.now() - 2 * 3600 * 1000);
    expect(isNewListing(date, 1)).toBe(false);
    expect(isNewListing(date, 3)).toBe(true);
  });
});

describe('formatPrice / formatPriceParts', () => {
  it('formats a MAD price without throwing, in every supported language', () => {
    for (const lang of ['fr', 'en', 'de', 'es', 'it', 'ar']) {
      expect(() => formatPrice(1500, 'MAD', lang)).not.toThrow();
    }
  });

  it('splits amount and currency into separate parts', () => {
    const parts = formatPriceParts(1500, 'MAD', 'fr');
    expect(parts.amount.length).toBeGreaterThan(0);
    expect(parts.currency.length).toBeGreaterThan(0);
  });
});

describe('timeAgo', () => {
  it('reports something for a recent timestamp without throwing', () => {
    const result = timeAgo(new Date(Date.now() - 5000), 'fr');
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });
});
