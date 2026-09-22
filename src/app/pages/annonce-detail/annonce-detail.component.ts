import { Component, OnInit, OnDestroy, signal, ChangeDetectorRef, HostListener, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { LocalizedRouterLinkDirective } from '../../directives/localized-router-link.directive';
import { SeoService, SITE_URL } from '../../services/seo.service';
import { FormsModule } from '@angular/forms';
import { ListingService } from '../../services/listing.service';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { Listing, ListingAttributeValue, CATEGORIES, formatPriceParts, timeAgo, isNewListing, exactDateTime, localeForLang } from '../../models/listing.model';
import { firstValueFrom } from 'rxjs';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { CityLabelPipe } from '../../pipes/city-label.pipe';
import { I18nService } from '../../services/i18n.service';
import { ReviewService, CanReviewResponse } from '../../services/review.service';
import { ReportButtonComponent } from '../../components/report-button/report-button.component';
import { ListingCardComponent } from '../../components/listing-card/listing-card.component';
import { StarRatingComponent } from '../../components/star-rating/star-rating.component';
import { VerifiedBadgeComponent } from '../../components/verified-badge/verified-badge.component';
import { ListingsMapComponent } from '../../components/listings-map/listings-map.component';
import { IconComponent } from '../../components/icon/icon.component';
import { FlagIconComponent } from '../../components/flag-icon/flag-icon.component';

@Component({
  selector: 'app-annonce-detail',
  imports: [CommonModule, RouterLink, LocalizedRouterLinkDirective, FormsModule, TranslatePipe, CityLabelPipe, ReportButtonComponent, ListingCardComponent, StarRatingComponent, VerifiedBadgeComponent, ListingsMapComponent, IconComponent, FlagIconComponent],
  templateUrl: './annonce-detail.component.html',
  styleUrl: './annonce-detail.component.scss'
})
export class AnnonceDetailComponent implements OnInit, OnDestroy {
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
  showMap = signal(false);
  lightboxOpen = signal(false);

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
    private reviewService: ReviewService,
    private seo: SeoService
  ) {}

  @HostListener('document:click', ['$event'])
  onDocumentClick(e: MouseEvent) {
    if (this.shareMenuOpen() && !(e.target as HTMLElement).closest('.detail__share-wrap')) {
      this.shareMenuOpen.set(false);
    }
  }

  @HostListener('document:keydown', ['$event'])
  onDocumentKeydown(e: KeyboardEvent) {
    if (!this.lightboxOpen()) return;
    if (e.key === 'Escape') this.closeLightbox();
    else if (e.key === 'ArrowLeft') this.prevImage();
    else if (e.key === 'ArrowRight') this.nextImage();
  }

  openLightbox() {
    if (!this.listing?.images.length) return;
    this.lightboxOpen.set(true);
  }

  closeLightbox() {
    this.lightboxOpen.set(false);
  }

  prevImage() {
    if (!this.listing) return;
    const count = this.listing.images.length;
    this.selectedImage = (this.selectedImage - 1 + count) % count;
  }

  nextImage() {
    if (!this.listing) return;
    const count = this.listing.images.length;
    this.selectedImage = (this.selectedImage + 1) % count;
  }

  ngOnInit() {
    // A route-to-route navigation between two listing detail pages (e.g.
    // clicking a "you might also like" card below) reuses this component
    // instead of recreating it, so ngOnInit only runs once — subscribing to
    // paramMap (rather than reading route.snapshot once) is what makes the
    // page actually reload when just the :id changes.
    this.route.paramMap.subscribe(params => {
      const id = params.get('id')!;
      this.loading = true;
      this.loadError = false;
      this.similarListings = [];
      this.selectedImage = 0;
      this.showMap.set(false);
      this.cdr.markForCheck();
      this.ls.getById(id).subscribe({
        next: listing => {
          this.listing = listing;
          this.loading = false;
          this.updateMetaTags(listing);
          this.cdr.markForCheck();
          if (this.auth.isLoggedIn) { this.checkFavorite(); this.checkCanReview(id); }
          this.loadSimilar(id);
        },
        error: (e) => { console.error('Detail error:', e); this.loading = false; this.loadError = true; this.cdr.markForCheck(); }
      });
    });
  }

  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private updateMetaTags(listing: Listing) {
    const title = `${listing.title} — SouqMar24`;
    const description = listing.description?.slice(0, 160) || '';
    const image = listing.images?.[0] || '';
    // Built explicitly (not this.seo.canonicalUrl) so a stray query param
    // (referrer tags, etc.) never leaks into the canonical/hreflang URLs.
    const url = `${SITE_URL}/${this.i18n.lang()}/annonces/${listing.id}`;

    this.seo.setTitleAndDescription(title, description);
    this.seo.setCanonical(url);
    this.seo.setHreflangAlternates(`/annonces/${listing.id}`);
    this.seo.updateTag({ property: 'og:type', content: 'website' });
    this.seo.updateTag({ property: 'og:image', content: image });
    this.seo.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.seo.updateTag({ name: 'twitter:title', content: title });
    this.seo.updateTag({ name: 'twitter:description', content: description });
    this.seo.updateTag({ name: 'twitter:image', content: image });

    // Product/Offer JSON-LD — lets Google show price/availability directly
    // in the search result (rich snippet), no ranking guarantee but a real,
    // well-documented click-through-rate lever for listing pages.
    this.seo.setStructuredData('listing-structured-data', {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: listing.title,
      description: listing.description || listing.title,
      image: listing.images?.length ? listing.images : undefined,
      url,
      offers: {
        '@type': 'Offer',
        price: listing.price ?? undefined,
        priceCurrency: listing.currency || 'MAD',
        availability: listing.status === 'ACTIVE'
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
        url,
      },
    });
  }

  ngOnDestroy() {
    this.seo.setTitleAndDescription('SouqMar24', '');
    this.seo.removeStructuredData('listing-structured-data');
    this.seo.removeHreflangAlternates();
  }

  similarListings: Listing[] = [];

  loadSimilar(id: string) {
    this.ls.getSimilar(id).subscribe({
      next: listings => { this.similarListings = listings; this.cdr.markForCheck(); },
      error: () => { /* non-essential section — fail silently */ }
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
    if (!this.auth.isLoggedIn) { this.router.navigate(this.i18n.withLang(['/auth/login'])); return; }
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
  // wa.me links want digits only (no "+", no spaces) — strip whatever
  // formatting the stored number happens to have rather than assuming it's
  // already clean E.164.
  get whatsappDigits(): string { return (this.listing?.whatsapp ?? '').replace(/\D/g, ''); }
  get priceParts(): { amount: string; currency: string } | null {
    if (this.listing?.price == null) return null;
    return formatPriceParts(this.listing.price, this.listing.currency, this.i18n.lang());
  }

  get negotiateLabel(): string {
    return this.i18n.t('listing.negotiate');
  }

  get isFree(): boolean {
    return this.listing?.priceType === 'FREE';
  }

  get isNegotiableWithPrice(): boolean {
    return this.listing?.priceType === 'NEGOTIABLE' && this.listing?.price != null;
  }

  get isSearchIntent(): boolean {
    return this.listing?.intent === 'SEARCH';
  }
  get foreignCountry(): string | null {
    return this.listing?.country && this.listing.country !== 'MA' ? this.listing.country : null;
  }
  get timeDisplay() { return this.listing ? timeAgo(this.listing.createdAt, this.i18n.lang()) : ''; }
  get exactTime() { return this.listing ? exactDateTime(this.listing.createdAt, this.i18n.lang()) : ''; }
  get isNew(): boolean { return this.listing ? isNewListing(this.listing.createdAt) : false; }

  get specAttrs(): ListingAttributeValue[] {
    // MULTI_SELECT attributes store one row per selected value — keep only
    // the first row per definition here (formatAttrValue joins all of them),
    // otherwise @for would see the same attributeDefinitionId more than once.
    const seen = new Set<string>();
    return [...(this.listing?.attributeValues ?? [])]
      .filter(av => {
        if (!av.attributeDefinition) return false;
        if (seen.has(av.attributeDefinitionId)) return false;
        seen.add(av.attributeDefinitionId);
        return true;
      })
      .sort((a, b) => a.attributeDefinition!.sortOrder - b.attributeDefinition!.sortOrder);
  }

  formatAttrValue(av: ListingAttributeValue): string {
    const def = av.attributeDefinition!;
    if (def.type === 'MULTI_SELECT') {
      return (this.listing?.attributeValues ?? [])
        .filter(x => x.attributeDefinitionId === av.attributeDefinitionId)
        .map(x => this.i18n.t('attrs.opts.' + x.valueText))
        .join(', ');
    }
    if (def.type === 'SELECT') return this.i18n.t('attrs.opts.' + av.valueText);
    if (def.type === 'BOOLEAN') return this.i18n.t(av.valueBoolean ? 'common.yes' : 'common.no');
    if (def.type === 'NUMBER') return String(av.valueNumber);
    if (def.type === 'DATE' && av.valueText) {
      const locale = localeForLang(this.i18n.lang());
      return new Date(av.valueText).toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' });
    }
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
