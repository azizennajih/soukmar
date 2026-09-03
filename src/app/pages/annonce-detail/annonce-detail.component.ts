import { Component, OnInit, signal, ChangeDetectorRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ListingService } from '../../services/listing.service';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { Listing, ListingAttributeValue, CATEGORIES, formatPriceParts, timeAgo } from '../../models/listing.model';
import { firstValueFrom } from 'rxjs';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { I18nService } from '../../services/i18n.service';
import { ReviewService, CanReviewResponse } from '../../services/review.service';

@Component({
  selector: 'app-annonce-detail',
  imports: [CommonModule, RouterLink, FormsModule, TranslatePipe],
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
  loadError = false;
  favorited = signal(false);
  favLoading = signal(false);
  shareCopied = signal(false);
  shareMenuOpen = signal(false);

  canReviewInfo: CanReviewResponse | null = null;
  showReviewForm = signal(false);
  reviewRating = 5;
  reviewComment = '';
  reviewSubmitting = false;
  reviewSubmitted = false;
  stars = [1, 2, 3, 4, 5];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ls: ListingService,
    private api: ApiService,
    public auth: AuthService,
    private cdr: ChangeDetectorRef,
    public i18n: I18nService,
    private reviewService: ReviewService
  ) {}

  @HostListener('document:click', ['$event'])
  onDocumentClick(e: MouseEvent) {
    if (this.shareMenuOpen() && !(e.target as HTMLElement).closest('.detail__share-wrap')) {
      this.shareMenuOpen.set(false);
    }
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.ls.getById(id).subscribe({
      next: listing => {
        this.listing = listing;
        this.loading = false;
        this.cdr.markForCheck();
        if (this.auth.isLoggedIn) { this.checkFavorite(); this.checkCanReview(id); }
      },
      error: (e) => { console.error('Detail error:', e); this.loading = false; this.loadError = true; this.cdr.markForCheck(); }
    });
  }

  checkCanReview(listingId: string) {
    this.reviewService.canReview(listingId).subscribe({
      next: r => { this.canReviewInfo = r; this.cdr.markForCheck(); },
      error: () => {}
    });
  }

  submitReview() {
    if (!this.canReviewInfo?.revieweeId || !this.listing) return;
    this.reviewSubmitting = true;
    this.reviewService.submit({
      listingId: this.listing.id,
      revieweeId: this.canReviewInfo.revieweeId,
      rating: this.reviewRating,
      comment: this.reviewComment.trim() || undefined
    }).subscribe({
      next: () => {
        this.reviewSubmitted = true;
        this.reviewSubmitting = false;
        this.showReviewForm.set(false);
        if (this.canReviewInfo) this.canReviewInfo.canReview = false;
        this.cdr.markForCheck();
      },
      error: () => { this.reviewSubmitting = false; this.cdr.markForCheck(); }
    });
  }

  get priceComparisonPct(): number | null {
    if (!this.listing?.price || !this.listing?.avgPrice) return null;
    return Math.round(((this.listing.price - this.listing.avgPrice) / this.listing.avgPrice) * 100);
  }

  async checkFavorite() {
    try {
      const favs = await firstValueFrom(this.api.get<Listing[]>('/favorites'));
      this.favorited.set(favs.some(f => f.id === this.listing?.id));
    } catch { /* silently ignore */ }
  }

  toggleFav() {
    if (!this.auth.isLoggedIn) { this.router.navigate(['/auth/login']); return; }
    if (this.favLoading() || !this.listing) return;
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

  async share(e: Event) {
    e.stopPropagation();
    if (!this.listing) return;
    // Native OS share sheet on mobile; a menu with WhatsApp/Email/Copy on desktop,
    // where navigator.share is usually unavailable.
    if (navigator.share) {
      try { await navigator.share({ title: this.listing.title, url: window.location.href }); } catch { /* user cancelled the native sheet */ }
      return;
    }
    this.shareMenuOpen.update(v => !v);
  }

  shareWhatsapp() {
    if (!this.listing) return;
    const text = `${this.listing.title} — ${window.location.href}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    this.shareMenuOpen.set(false);
  }

  shareEmail() {
    if (!this.listing) return;
    const subject = this.listing.title;
    const body = window.location.href;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    this.shareMenuOpen.set(false);
  }

  async copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      this.shareCopied.set(true);
      setTimeout(() => this.shareCopied.set(false), 2000);
    } catch { /* clipboard blocked — nothing we can do without a permission prompt */ }
    this.shareMenuOpen.set(false);
  }

  get category() { return CATEGORIES.find(c => c.value === this.listing?.category); }
  get priceParts(): { amount: string; currency: string } | null {
    if (this.listing?.price == null) return null;
    return formatPriceParts(this.listing.price, this.listing.currency, this.i18n.lang());
  }

  get negotiateLabel(): string {
    return this.i18n.t('listing.negotiate');
  }
  get timeDisplay() { return this.listing ? timeAgo(this.listing.createdAt, this.i18n.lang()) : ''; }

  get specAttrs(): ListingAttributeValue[] {
    return [...(this.listing?.attributeValues ?? [])]
      .filter(av => av.attributeDefinition)
      .sort((a, b) => a.attributeDefinition!.sortOrder - b.attributeDefinition!.sortOrder);
  }

  formatAttrValue(av: ListingAttributeValue): string {
    const def = av.attributeDefinition!;
    if (def.type === 'SELECT') return this.i18n.t('attrs.opts.' + av.valueText);
    if (def.type === 'BOOLEAN') return this.i18n.t(av.valueBoolean ? 'common.yes' : 'common.no');
    if (def.type === 'NUMBER') return String(av.valueNumber);
    return av.valueText ?? '';
  }

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
