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

  get statusConfig(): Record<string, { label: string; cls: string }> {
    const t = (k: string) => this.i18n.t(k);
    return {
      ACTIVE:   { label: t('annonces.active') || 'Active',       cls: 'badge-active'   },
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

  getCategory(val: string) { return CATEGORIES.find(c => c.value === val); }
  price(l: Listing) { return l.price != null ? formatPrice(l.price, l.currency) : 'À négocier'; }
  time(l: Listing)  { return timeAgo(l.createdAt); }
}
