import { Component, OnInit, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ListingService } from '../../services/listing.service';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { Listing, ListingAttributeValue, CATEGORIES, formatPrice, timeAgo } from '../../models/listing.model';
import { firstValueFrom } from 'rxjs';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { I18nService } from '../../services/i18n.service';

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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ls: ListingService,
    private api: ApiService,
    public auth: AuthService,
    private cdr: ChangeDetectorRef,
    public i18n: I18nService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.ls.getById(id).subscribe({
      next: listing => {
        this.listing = listing;
        this.loading = false;
        this.cdr.markForCheck();
        if (this.auth.isLoggedIn) this.checkFavorite();
      },
      error: (e) => { console.error('Detail error:', e); this.loading = false; this.loadError = true; this.cdr.markForCheck(); }
    });
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

  async share() {
    if (!this.listing) return;
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: this.listing.title, url }); } catch { /* user cancelled the native sheet */ }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      this.shareCopied.set(true);
      setTimeout(() => this.shareCopied.set(false), 2000);
    } catch { /* clipboard blocked — nothing we can do without a permission prompt */ }
  }

  get category() { return CATEGORIES.find(c => c.value === this.listing?.category); }
  get priceDisplay() {
    const lang = this.i18n.lang();
    return this.listing?.price != null
      ? formatPrice(this.listing.price, this.listing.currency, lang)
      : this.i18n.t('listing.negotiate');
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
