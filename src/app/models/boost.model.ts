import type { IconName } from '../components/icon/icon.component';

export type BoostTierId = 'bump' | 'spotlight' | 'top' | 'global';

export interface BoostTier {
  id: BoostTierId;
  durationDays: number | null;
  icon: IconName;
}

// Kept in sync by hand with soukmar-backend/src/lib/boosts.ts — the backend
// is the source of truth for pricing (it re-validates and re-quotes on
// submit), this copy only drives the instant on-screen price preview.
export const BOOST_TIERS: BoostTier[] = [
  { id: 'bump', durationDays: null, icon: 'arrow-up' },
  { id: 'spotlight', durationDays: 7, icon: 'zap' },
  { id: 'top', durationDays: 7, icon: 'crown' },
  { id: 'global', durationDays: 10, icon: 'globe' },
];

/** Boost prices per currency. A listing in a currency without its own price list is charged in EUR. */
export const BOOST_PRICES: Record<string, Record<BoostTierId, number>> = {
  MAD: { bump: 15, spotlight: 39, top: 59, global: 89 },
  EUR: { bump: 1.49, spotlight: 3.99, top: 5.99, global: 8.99 },
  USD: { bump: 1.59, spotlight: 4.29, top: 6.49, global: 9.99 },
  GBP: { bump: 1.29, spotlight: 3.49, top: 4.99, global: 7.49 },
  CHF: { bump: 1.49, spotlight: 3.99, top: 5.99, global: 8.99 },
};

/** The currency a boost for a listing in `listingCurrency` is charged in. */
export function boostCurrency(listingCurrency: string | null | undefined): string {
  return listingCurrency && BOOST_PRICES[listingCurrency] ? listingCurrency : 'EUR';
}

export function tierPrice(id: BoostTierId, currency: string): number {
  return (BOOST_PRICES[currency] ?? BOOST_PRICES['EUR']!)[id];
}

export interface BoostRequest {
  id: string;
  listingId: string;
  userId: string;
  tiers: BoostTierId[];
  totalPrice: number;
  currency: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  adminNote?: string | null;
  createdAt: Date;
  resolvedAt?: Date | null;
}

export interface BoostStatus {
  boostSpotlightUntil: string | null;
  boostTopUntil: string | null;
  boostGlobalUntil: string | null;
  pendingRequest: BoostRequest | null;
}

export function quoteBoostPrice(tierIds: BoostTierId[], currency = 'MAD'): { subtotal: number; discountPercent: number; total: number } {
  const cents = (n: number) => Math.round(n * 100) / 100;
  const subtotal = cents(tierIds.reduce((sum, id) => sum + tierPrice(id, currency), 0));
  const discountPercent = tierIds.length >= 2 ? 10 : 0;
  const discounted = subtotal * (1 - discountPercent / 100);
  const total = currency === 'MAD' ? Math.round(discounted) : cents(discounted);
  return { subtotal, discountPercent, total };
}
