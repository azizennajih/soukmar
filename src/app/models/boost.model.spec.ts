import { describe, it, expect } from 'vitest';
import { boostCurrency, quoteBoostPrice } from './boost.model';

describe('boost prices per currency', () => {
  it('uses the listing currency when it has a price list, otherwise EUR', () => {
    expect(boostCurrency('MAD')).toBe('MAD');
    expect(boostCurrency('GBP')).toBe('GBP');
    expect(boostCurrency('JPY')).toBe('EUR');
    expect(boostCurrency(undefined)).toBe('EUR');
  });

  it('quotes MAD in whole dirhams and other currencies with cents (10% bundle discount)', () => {
    expect(quoteBoostPrice(['bump', 'spotlight'], 'MAD')).toEqual({ subtotal: 54, discountPercent: 10, total: 49 });
    expect(quoteBoostPrice(['spotlight'], 'EUR')).toEqual({ subtotal: 3.99, discountPercent: 0, total: 3.99 });
    expect(quoteBoostPrice(['bump', 'top'], 'EUR')).toEqual({ subtotal: 7.48, discountPercent: 10, total: 6.73 });
  });
});
