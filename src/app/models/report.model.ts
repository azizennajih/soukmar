export type ReportStatus = 'PENDING' | 'RESOLVED' | 'DISMISSED';

export interface Report {
  id: string;
  listingId?: string | null;
  reporterId: string;
  reportedId: string;
  reason: string;
  status: ReportStatus;
  adminNote?: string | null;
  createdAt: Date;
  resolvedAt?: Date | null;
  reporter?: { id: string; name: string; email: string };
  reported?: { id: string; name: string; email: string };
  listing?: { id: string; title: string } | null;
}
