import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ListingService } from '../../services/listing.service';
import { I18nService } from '../../services/i18n.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { Listing, CATEGORIES, formatPrice, timeAgo } from '../../models/listing.model';

@Component({
  selector: 'app-mes-annonces',
  imports: [CommonModule, RouterLink, TranslatePipe],
  templateUrl: './mes-annonces.component.html',
  styleUrl: './mes-annonces.component.scss'
})
export class MesAnnoncesComponent implements OnInit {
  i18n = inject(I18nService);
  listings: Listing[] = [];
  loading = false;
  bumping: Record<string, boolean> = {};
  statsOpenId: string | null = null;
  statsData: Record<string, { date: string; count: number }[]> = {};

  get statusConfig(): Record<string, { label: string; cls: string }> {
    const t = (k: string) => this.i18n.t(k);
    return {
      ACTIVE:   { label: t('annonces.active') || 'Active',       cls: 'badge-active'   },
      RESERVED: { label: t('annonces.reserved') || 'Réservée',   cls: 'badge-pending'  },
      SOLD:     { label: t('annonces.sold') || 'Vendue',         cls: 'badge-sold'     },
      PENDING:  { label: t('annonces.pending') || 'En attente',  cls: 'badge-pending'  },
      REJECTED: { label: t('annonces.rejected') || 'Rejetée',    cls: 'badge-rejected' },
      EXPIRED:  { label: t('annonces.expired') || 'Expirée',     cls: 'badge-rejected' },
    };
  }

  constructor(public auth: AuthService, private ls: ListingService, private router: Router, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    if (!this.auth.isLoggedIn) { this.router.navigate(['/auth/login']); return; }
    this.loading = true;
    this.ls.getMyListings().subscribe({
      next: listings => { this.listings = listings; this.loading = false; this.cdr.markForCheck(); },
      error: () => { this.loading = false; this.cdr.markForCheck(); }
    });
  }

  delete(id: string) {
    if (!confirm(this.i18n.t('mes_annonces.confirm_delete'))) return;
    this.ls.delete(id).subscribe(() => {
      this.listings = this.listings.filter(l => l.id !== id);
    });
  }

  toggleReserve(listing: Listing) {
    const nextStatus = listing.status === 'RESERVED' ? 'ACTIVE' : 'RESERVED';
    const prevStatus = listing.status;
    listing.status = nextStatus;
    this.cdr.markForCheck();
    this.ls.update(listing.id, { status: nextStatus }).subscribe({
      error: () => { listing.status = prevStatus; this.cdr.markForCheck(); }
    });
  }

  getCategory(val: string) { return CATEGORIES.find(c => c.value === val); }
  price(l: Listing) { return l.price != null ? formatPrice(l.price, l.currency) : 'À négocier'; }
  time(l: Listing)  { return timeAgo(l.createdAt); }

  canBump(listing: Listing): boolean {
    if (!listing.bumpedAt) return true;
    return Date.now() - new Date(listing.bumpedAt).getTime() >= 24 * 3_600_000;
  }

  bump(listing: Listing) {
    if (this.bumping[listing.id] || !this.canBump(listing)) return;
    this.bumping[listing.id] = true;
    this.ls.bump(listing.id).subscribe({
      next: updated => { listing.bumpedAt = updated.bumpedAt; this.bumping[listing.id] = false; this.cdr.markForCheck(); },
      error: () => { this.bumping[listing.id] = false; this.cdr.markForCheck(); }
    });
  }

  toggleStats(listing: Listing) {
    this.statsOpenId = this.statsOpenId === listing.id ? null : listing.id;
    if (this.statsOpenId && !this.statsData[listing.id]) {
      this.ls.getViewStats(listing.id).subscribe({
        next: res => { this.statsData[listing.id] = res.days; this.cdr.markForCheck(); },
        error: () => {}
      });
    }
  }

  maxCount(listing: Listing): number {
    const days = this.statsData[listing.id] || [];
    return Math.max(1, ...days.map(d => d.count));
  }

  barHeight(listing: Listing, count: number): number {
    return Math.max(4, Math.round((count / this.maxCount(listing)) * 40));
  }
}
