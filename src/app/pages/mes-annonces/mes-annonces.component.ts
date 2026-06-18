import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ListingService } from '../../services/listing.service';
import { Listing, CATEGORIES, formatPrice, timeAgo } from '../../models/listing.model';

@Component({
  selector: 'app-mes-annonces',
  imports: [CommonModule, RouterLink],
  templateUrl: './mes-annonces.component.html',
  styleUrl: './mes-annonces.component.scss'
})
export class MesAnnoncesComponent implements OnInit {
  listings: Listing[] = [];

  statusConfig: Record<string, { label: string; cls: string }> = {
    ACTIVE:   { label: 'Active',      cls: 'badge-active'   },
    SOLD:     { label: 'Vendue',      cls: 'badge-sold'     },
    PENDING:  { label: 'En attente',  cls: 'badge-pending'  },
    REJECTED: { label: 'Rejetée',     cls: 'badge-rejected' },
    EXPIRED:  { label: 'Expirée',     cls: 'badge-rejected' },
  };

  constructor(public auth: AuthService, private ls: ListingService, private router: Router) {}

  ngOnInit() {
    if (!this.auth.isLoggedIn) { this.router.navigate(['/auth/login']); return; }
    this.listings = this.ls.getUserListings(this.auth.currentUser()!.id);
    // show all mock listings for demo
    if (!this.listings.length) this.listings = this.ls.getLatest(8);
  }

  getCategory(val: string) { return CATEGORIES.find(c => c.value === val); }
  price(l: Listing) { return l.price != null ? formatPrice(l.price, l.currency) : 'À négocier'; }
  time(l: Listing)  { return timeAgo(l.createdAt); }
}
