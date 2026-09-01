import { Component, Input, OnInit, signal, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Listing, CATEGORIES, formatPrice, timeAgo } from '../../models/listing.model';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { I18nService } from '../../services/i18n.service';

@Component({
  selector: 'app-listing-card',
  imports: [CommonModule, RouterLink, TranslatePipe],
  templateUrl: './listing-card.component.html',
  styleUrl: './listing-card.component.scss'
})
export class ListingCardComponent implements OnInit {
  @Input() listing!: Listing;
  @Input() featured = false;
  @Input() initialFav = false;

  private api = inject(ApiService);
  private auth = inject(AuthService);
  private i18n = inject(I18nService);

  favorited = signal(false);
  favLoading = signal(false);

  ngOnInit() {
    this.favorited.set(this.initialFav);
  }

  get category() {
    return CATEGORIES.find(c => c.value === this.listing.category);
  }

  get priceDisplay(): string {
    const lang = this.i18n.lang();
    return this.listing.price != null
      ? formatPrice(this.listing.price, this.listing.currency, lang)
      : this.i18n.t('listing.negotiate');
  }

  get timeDisplay(): string {
    return timeAgo(this.listing.createdAt, this.i18n.lang());
  }

  toggleFav(e: Event) {
    e.preventDefault();
    e.stopPropagation();
    if (!this.auth.isLoggedIn) {
      window.location.href = '/auth/login';
      return;
    }
    if (this.favLoading()) return;
    const wasFav = this.favorited();
    this.favorited.set(!wasFav);
    this.favLoading.set(true);
    const req$ = wasFav
      ? this.api.delete(`/favorites/${this.listing.id}`)
      : this.api.post(`/favorites/${this.listing.id}`, {});
    req$.subscribe({
      error: () => { this.favorited.set(wasFav); this.favLoading.set(false); },
      complete: () => this.favLoading.set(false)
    });
  }
}
