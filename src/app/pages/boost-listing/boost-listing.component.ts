import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LocalizedRouterLinkDirective } from '../../directives/localized-router-link.directive';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { ListingService } from '../../services/listing.service';
import { I18nService } from '../../services/i18n.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { IconComponent } from '../../components/icon/icon.component';
import { Listing, formatPrice } from '../../models/listing.model';
import { BoostStatus, BoostTier, BoostTierId, BOOST_TIERS, quoteBoostPrice } from '../../models/boost.model';

@Component({
  selector: 'app-boost-listing',
  imports: [CommonModule, RouterLink, LocalizedRouterLinkDirective, TranslatePipe, IconComponent],
  templateUrl: './boost-listing.component.html',
  styleUrl: './boost-listing.component.scss'
})
export class BoostListingComponent implements OnInit {
  i18n = inject(I18nService);
  readonly tiers = BOOST_TIERS;

  listing: Listing | null = null;
  status: BoostStatus | null = null;
  selected = new Set<BoostTierId>();
  loading = true;
  submitting = false;
  submitted = false;
  errorMsg = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public auth: AuthService,
    private listingService: ListingService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    if (!this.auth.isLoggedIn) { this.router.navigate(this.i18n.withLang(['/auth/login'])); return; }
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.router.navigate(this.i18n.withLang(['/mes-annonces'])); return; }

    try {
      const [listing, status] = await Promise.all([
        firstValueFrom(this.listingService.getById(id)),
        firstValueFrom(this.listingService.getBoostStatus(id)),
      ]);
      if (listing.userId !== this.auth.currentUser()?.id) { this.router.navigate(this.i18n.withLang(['/mes-annonces'])); return; }
      this.listing = listing;
      this.status = status;
    } catch {
      this.router.navigate(this.i18n.withLang(['/mes-annonces']));
      return;
    } finally {
      this.loading = false;
      this.cdr.markForCheck();
    }
  }

  isActiveUntil(tierId: BoostTierId): Date | null {
    if (!this.status) return null;
    const map: Record<BoostTierId, keyof BoostStatus | null> = {
      bump: null,
      spotlight: 'boostSpotlightUntil',
      top: 'boostTopUntil',
      global: 'boostGlobalUntil',
    };
    const key = map[tierId];
    if (!key) return null;
    const raw = this.status[key] as string | null;
    if (!raw || new Date(raw).getTime() <= Date.now()) return null;
    return new Date(raw);
  }

  toggle(tierId: BoostTierId) {
    if (this.selected.has(tierId)) this.selected.delete(tierId);
    else this.selected.add(tierId);
  }

  get quote() {
    return quoteBoostPrice([...this.selected]);
  }

  tierLabels(tiers: BoostTierId[]): string {
    return tiers.map(id => this.i18n.t('boost.tier_' + id + '_name')).join(', ');
  }

  formatDuration(tier: BoostTier): string {
    return tier.durationDays == null
      ? this.i18n.t('boost.duration_instant')
      : this.i18n.t('boost.duration_days').replace('{n}', String(tier.durationDays));
  }

  formatPrice(amount: number): string {
    return formatPrice(amount, this.listing?.currency ?? 'MAD', this.i18n.lang());
  }

  async submit() {
    if (this.selected.size === 0) { this.errorMsg = this.i18n.t('boost.select_at_least_one'); return; }
    if (!this.listing || this.submitting) return;
    this.submitting = true;
    this.errorMsg = '';
    try {
      const request = await firstValueFrom(this.listingService.requestBoost(this.listing.id, [...this.selected]));
      this.status = { ...this.status!, pendingRequest: request };
      this.submitted = true;
    } catch {
      this.errorMsg = this.i18n.t('boost.error_generic');
    } finally {
      this.submitting = false;
      this.cdr.markForCheck();
    }
  }
}
