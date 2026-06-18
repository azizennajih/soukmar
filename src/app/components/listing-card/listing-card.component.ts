import { Component, Input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Listing, CATEGORIES, formatPrice, timeAgo } from '../../models/listing.model';

@Component({
  selector: 'app-listing-card',
  imports: [CommonModule, RouterLink],
  templateUrl: './listing-card.component.html',
  styleUrl: './listing-card.component.scss'
})
export class ListingCardComponent {
  @Input() listing!: Listing;
  @Input() featured = false;

  favorited = signal(false);

  get category() {
    return CATEGORIES.find(c => c.value === this.listing.category);
  }

  get priceDisplay(): string {
    return this.listing.price != null
      ? formatPrice(this.listing.price, this.listing.currency)
      : 'Prix à négocier';
  }

  get timeDisplay(): string {
    return timeAgo(this.listing.createdAt);
  }

  toggleFav(e: Event) {
    e.preventDefault();
    e.stopPropagation();
    this.favorited.update(v => !v);
  }
}
