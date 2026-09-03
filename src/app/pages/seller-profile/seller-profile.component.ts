import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../../services/user.service';
import { ReviewService } from '../../services/review.service';
import { Listing, Review, SellerProfile, timeAgo } from '../../models/listing.model';
import { ListingCardComponent } from '../../components/listing-card/listing-card.component';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { I18nService } from '../../services/i18n.service';

@Component({
  selector: 'app-seller-profile',
  imports: [CommonModule, ListingCardComponent, TranslatePipe],
  templateUrl: './seller-profile.component.html',
  styleUrl: './seller-profile.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SellerProfileComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private userService = inject(UserService);
  private reviewService = inject(ReviewService);
  public i18n = inject(I18nService);
  private cdr = inject(ChangeDetectorRef);

  profile: SellerProfile | null = null;
  listings: Listing[] = [];
  reviews: Review[] = [];
  loading = true;
  notFound = false;
  stars = [1, 2, 3, 4, 5];

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.notFound = true; this.loading = false; return; }

    this.userService.getProfile(id).subscribe({
      next: p => { this.profile = p; this.cdr.markForCheck(); },
      error: () => { this.notFound = true; this.loading = false; this.cdr.markForCheck(); }
    });
    this.userService.getListings(id).subscribe({
      next: l => { this.listings = l; this.loading = false; this.cdr.markForCheck(); },
      error: () => { this.loading = false; this.cdr.markForCheck(); }
    });
    this.reviewService.getForUser(id).subscribe({
      next: r => { this.reviews = r.reviews; this.cdr.markForCheck(); },
      error: () => {}
    });
  }

  memberSince(date: Date): string {
    return new Date(date).toLocaleDateString(this.i18n.lang(), { year: 'numeric', month: 'long' });
  }

  responseLabel(hours: number | null): string | null {
    if (hours == null) return null;
    if (hours < 1) return this.i18n.t('seller.responds_minutes');
    if (hours < 24) return this.i18n.t('seller.responds_hours', { hours: String(Math.round(hours)) });
    return this.i18n.t('seller.responds_days', { days: String(Math.round(hours / 24)) });
  }

  reviewTime(date: Date): string {
    return timeAgo(date, this.i18n.lang());
  }

  get roundedRating(): number {
    return this.profile?.avgRating ? Math.round(this.profile.avgRating) : 0;
  }
}
