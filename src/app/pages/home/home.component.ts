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
import { CATEGORIES, MOROCCO_CITIES, Listing, Category } from '../../models/listing.model';
import { CITIES_BY_COUNTRY, countryName } from '../../models/country.model';
import { CountryService } from '../../services/country.service';
import { I18nService } from '../../services/i18n.service';
import { firstValueFrom } from 'rxjs';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { CityLabelPipe } from '../../pipes/city-label.pipe';
import { SeoService } from '../../services/seo.service';

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

  stats = [
    { labelKey: 'home.stat_active_listings', value: '50K+' },
    { labelKey: 'home.stat_registered_users', value: '120K+' },
    { labelKey: 'home.stat_cities_covered', value: '50+' },
    { labelKey: 'home.stat_monthly_listings', value: '5K+' },
  ];

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
        this.featured = res.listings.filter(l => l.isFeatured);
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
    this.seo.setCanonical();
    this.seo.setHreflangAlternates('/');
    this.cdr.markForCheck();
    if (this.auth.isLoggedIn) {
      this.loadFavorites();
      this.loadInterests();
    }
  }

  loadInterests() {
    this.listingService.getInterests().subscribe({
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
