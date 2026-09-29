import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LocalizedRouterLinkDirective } from '../../directives/localized-router-link.directive';
import { Router } from '@angular/router';
import { ListingService } from '../../services/listing.service';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { ListingCardComponent } from '../../components/listing-card/listing-card.component';
import { CatIconComponent } from '../../components/cat-icon/cat-icon.component';
import { IconComponent } from '../../components/icon/icon.component';
import { CATEGORIES, MOROCCO_CITIES, Listing, Category, isBoostActive } from '../../models/listing.model';
import { CITIES_BY_COUNTRY, countryName } from '../../models/country.model';
import { CountryService } from '../../services/country.service';
import { I18nService } from '../../services/i18n.service';
import { firstValueFrom } from 'rxjs';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { CityLabelPipe } from '../../pipes/city-label.pipe';
import { SeoService, SITE_URL } from '../../services/seo.service';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterLink, LocalizedRouterLinkDirective, ListingCardComponent, CatIconComponent, TranslatePipe, CityLabelPipe, IconComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit {
  categories = CATEGORIES;
  get cities(): string[] {
    const c = this.countryService.country();
    const all = c === 'MA' ? MOROCCO_CITIES : (CITIES_BY_COUNTRY[c] ?? []);
    return all.slice(0, 12);
  }
  /** Localized name of the currently browsed country, for the hero heading.
   * Deliberately not "in {country}"/"au {country}"/etc. — the required
   * preposition's grammatical gender varies per country in French (and to a
   * lesser extent Italian/Spanish), so a single static template would read
   * correctly for Morocco but wrong for most other selectable countries. A
   * plain country name after a dash sidesteps that without a 195-country
   * gender table. */
  get heroCountryName(): string {
    return countryName(this.countryService.country(), this.i18n.lang());
  }
  featured: Listing[] = [];
  latest: Listing[] = [];
  favoriteIds = new Set<string>();
  interests: { category: Category; newListingsCount: number }[] = [];

  // Placeholder until loadStats() resolves (see ngOnInit) — real counts from
  // GET /api/stats/public, not hand-picked marketing numbers, so this bar
  // stays honest as the platform actually grows instead of needing a
  // manual edit before every "the numbers don't match reality" moment.
  stats = [
    { labelKey: 'home.stat_active_listings', value: '—' },
    { labelKey: 'home.stat_registered_users', value: '—' },
    { labelKey: 'home.stat_cities_covered', value: '—' },
    { labelKey: 'home.stat_monthly_listings', value: '—' },
  ];
  /** Raw (unabbreviated) active-listings count for the hero badge — null
   * until loadStats() resolves, hiding the badge rather than briefly
   * flashing "0 annonces actives". */
  heroActiveListingsCount: number | null = null;

  features = [
    { icon: 'zap' as const, titleKey: 'home.feature_fast_title', descKey: 'home.feature_fast_desc', bg: '#fef9c3', color: '#a16207' },
    { icon: 'shield' as const, titleKey: 'home.feature_secure_title', descKey: 'home.feature_secure_desc', bg: '#dcfce7', color: '#15803d' },
    { icon: 'users' as const, titleKey: 'home.feature_community_title', descKey: 'home.feature_community_desc', bg: '#dbeafe', color: '#1d4ed8' },
    { icon: 'trending-up' as const, titleKey: 'home.feature_boost_title', descKey: 'home.feature_boost_desc', bg: '#f3e8ff', color: '#7e22ce' },
  ];

  constructor(
    private listingService: ListingService,
    private api: ApiService,
    private auth: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    public countryService: CountryService,
    public i18n: I18nService,
    private seo: SeoService
  ) {
    // Re-runs whenever the navbar's country switcher changes — a visitor
    // sitting on the homepage sees it reflect the new country immediately,
    // not just on their next navigation.
    effect(() => {
      const country = this.countryService.country();
      this.listingService.getAll({ limit: '20', country }).subscribe(res => {
        this.featured = res.listings.filter(l => l.isFeatured || isBoostActive(l.boostGlobalUntil));
        this.latest = res.listings.slice(0, 8);
        this.cdr.markForCheck();
      });
    });
  }

  ngOnInit() {
    this.seo.setTitleAndDescription(
      'SouqMar24 — Achetez & vendez facilement',
      'La marketplace pour acheter et vendre rapidement : véhicules, immobilier, électronique, mode et plus encore.'
    );
    this.seo.setCanonical(`${SITE_URL}/${this.i18n.lang()}`);
    this.seo.setHreflangAlternates('/');
    this.cdr.markForCheck();
    if (this.auth.isLoggedIn) {
      this.loadFavorites();
      this.loadInterests();
    }
    this.loadStats();
  }

  private async loadStats() {
    try {
      const s = await firstValueFrom(this.api.get<{ activeListings: number; registeredUsers: number; citiesCovered: number; monthlyListings: number }>('/stats/public'));
      this.stats = [
        { labelKey: 'home.stat_active_listings', value: formatStatValue(s.activeListings) },
        { labelKey: 'home.stat_registered_users', value: formatStatValue(s.registeredUsers) },
        { labelKey: 'home.stat_cities_covered', value: formatStatValue(s.citiesCovered) },
        { labelKey: 'home.stat_monthly_listings', value: formatStatValue(s.monthlyListings) },
      ];
      this.heroActiveListingsCount = s.activeListings;
      this.cdr.markForCheck();
    } catch { /* non-essential section — keeps the "—" placeholders */ }
  }

  loadInterests() {
    this.listingService.getInterests(this.countryService.country()).subscribe({
      next: interests => { this.interests = interests; this.cdr.markForCheck(); },
      error: () => { /* non-essential section — fail silently */ }
    });
  }

  categoryOf(value: Category) {
    return this.categories.find(c => c.value === value);
  }

  async loadFavorites() {
    try {
      const favs = await firstValueFrom(this.api.get<Listing[]>('/favorites'));
      this.favoriteIds = new Set(favs.map(f => f.id));
    } catch { /* silently ignore */ }
  }

  isFav(listing: Listing): boolean {
    return this.favoriteIds.has(listing.id);
  }


  goToCity(city: string) {
    this.router.navigate(this.i18n.withLang(['/annonces']), { queryParams: { ville: city, pays: this.countryService.country() } });
  }
}

/** Abbreviates a real count for the stats bar — "50K+"/"1.2M+" once it's
 * large enough that an exact figure would be unreadable, but the literal
 * number (e.g. "33") while the platform is still small, since "33+" would
 * falsely imply an approximation of a number that's actually known exactly. */
function formatStatValue(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M+`;
  if (n >= 1_000) return `${Math.floor(n / 1000)}K+`;
  return `${n}`;
}
