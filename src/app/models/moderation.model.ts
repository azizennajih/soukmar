import type { Category, Listing, ListingStatus } from './listing.model';

export type ModerationAction = 'approve' | 'reject' | 'request-changes' | 'suspend' | 'requeue';
/** Names the server uses in `allowedActions` (snake_case); the URL uses the kebab-case form above. */
export type ModerationActionKey = 'approve' | 'reject' | 'request_changes' | 'suspend' | 'requeue';

export type SignalSeverity = 'low' | 'medium' | 'high';

export interface ModerationSignal {
  code: string;
  severity: SignalSeverity;
  /** English fallback from the server; the UI shows the translated text of the code when there is one. */
  message: string;
  params?: Record<string, string | number>;
}

export interface ModerationSummary {
  pending: number;
  changesRequested: number;
  suspended: number;
  decidedToday: number;
  highRiskPending: number;
  oldestPendingSince: string | null;
}

export interface ModerationQueueItem {
  id: string;
  title: string;
  category: Category;
  country: string;
  city: string;
  price: number | null;
  priceType: string;
  currency: string;
  status: ListingStatus;
  images: string[];
  imageCount: number;
  createdAt: string;
  submittedAt: string | null;
  statusChangedAt: string;
  moderatedAt: string | null;
  moderationReason: string | null;
  resubmitAllowed: boolean;
  moderationSignals: ModerationSignal[];
  riskScore: number;
  user: { id: string; name: string; email: string; emailVerified: boolean; createdAt: string };
}

export interface ModerationQueue {
  total: number;
  page: number;
  pages: number;
  listings: ModerationQueueItem[];
}

export interface ModerationEvent {
  id: string;
  listingId: string;
  fromStatus: ListingStatus | null;
  toStatus: ListingStatus;
  actorId: string | null;
  actorName: string | null;
  actorRole: 'ADMIN' | 'MODERATOR' | 'OWNER' | 'SYSTEM';
  reason: string | null;
  emailKind: string | null;
  emailStatus: 'PENDING' | 'SENT' | 'FAILED' | 'SKIPPED' | null;
  emailSentAt: string | null;
  emailError: string | null;
  createdAt: string;
}

export interface ModerationDuplicate extends ModerationSignal {
  listing: { id: string; title: string; status: ListingStatus; sameAccount: boolean } | null;
}

export interface ModerationSeller {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  city?: string | null;
  country?: string | null;
  role: string;
  accountType?: string | null;
  emailVerified: boolean;
  phoneVerified: boolean;
  idVerified: boolean;
  createdAt: string;
  listingsTotal: number;
  listingsPublic: number;
  listingsRejected: number;
  reportsAgainst: number;
}

export interface ModerationDetail {
  listing: Listing & { moderationSignals: ModerationSignal[]; moderationReason?: string | null; resubmitAllowed?: boolean; submittedAt?: string | null };
  riskScore: number;
  seller: ModerationSeller;
  duplicates: ModerationDuplicate[];
  events: ModerationEvent[];
  allowedActions: ModerationActionKey[];
}

export interface ModerationHistory {
  total: number;
  page: number;
  pages: number;
  events: (ModerationEvent & { listing: { id: string; title: string; country: string; category: string; status: ListingStatus; user: { id: string; name: string } } })[];
}
