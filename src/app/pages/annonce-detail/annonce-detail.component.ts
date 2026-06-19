import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ListingService } from '../../services/listing.service';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { Listing, CATEGORIES, formatPrice, timeAgo } from '../../models/listing.model';

@Component({
  selector: 'app-annonce-detail',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './annonce-detail.component.html',
  styleUrl: './annonce-detail.component.scss'
})
export class AnnonceDetailComponent implements OnInit {
  listing?: Listing;
  message = '';
  messageSent = false;
  messageSending = false;
  selectedImage = 0;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ls: ListingService,
    private api: ApiService,
    public auth: AuthService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.ls.getById(id).subscribe({
      next: listing => { this.listing = listing; this.loading = false; },
      error: () => { this.loading = false; this.router.navigate(['/annonces']); }
    });
  }

  get category() { return CATEGORIES.find(c => c.value === this.listing?.category); }
  get priceDisplay() {
    return this.listing?.price != null
      ? formatPrice(this.listing.price, this.listing.currency)
      : 'Prix à négocier';
  }
  get timeDisplay() { return this.listing ? timeAgo(this.listing.createdAt) : ''; }

  sendMessage() {
    if (!this.message.trim() || !this.listing) return;
    this.messageSending = true;
    this.api.post('/messages', {
      receiverId: this.listing.userId,
      listingId: this.listing.id,
      content: this.message.trim()
    }).subscribe({
      next: () => { this.messageSent = true; this.messageSending = false; },
      error: () => this.messageSending = false
    });
  }
}
