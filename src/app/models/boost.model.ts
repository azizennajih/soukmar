import type { IconName } from '../components/icon/icon.component';

export type BoostTierId = 'bump' | 'spotlight' | 'top' | 'global';

export interface BoostTier {
  id: BoostTierId;
  priceMAD: number;
  durationDays: number | null;
  icon: IconName;
}

// Kept in sync by hand with soukmar-backend/src/lib/boosts.ts — the backend
// is the source of truth for pricing (it re-validates and re-quotes on
// submit), this copy only drives the instant on-screen price preview.
export const BOOST_TIERS: BoostTier[] = [
  { id: 'bump', priceMAD: 15, durationDays: null, icon: 'arrow-up' },
  { id: 'spotlight', priceMAD: 39, durationDays: 7, icon: 'zap' },
  { id: 'top', priceMAD: 59, durationDays: 7, icon: 'crown' },
  { id: 'global', priceMAD: 89, durationDays: 10, icon: 'globe' },
];

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

export function quoteBoostPrice(tierIds: BoostTierId[]): { subtotal: number; discountPercent: number; total: number } {
  const byId = new Map(BOOST_TIERS.map(t => [t.id, t]));
  const subtotal = tierIds.reduce((sum, id) => sum + (byId.get(id)?.priceMAD ?? 0), 0);
  const discountPercent = tierIds.length >= 2 ? 10 : 0;
  const total = Math.round(subtotal * (1 - discountPercent / 100));
  return { subtotal, discountPercent, total };
}
