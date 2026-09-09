import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ListingService } from '../../services/listing.service';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { ListingCardComponent } from '../../components/listing-card/listing-card.component';
import { CitySelectComponent } from '../../components/city-select/city-select.component';
import { CatIconComponent } from '../../components/cat-icon/cat-icon.component';
import { CATEGORIES, MOROCCO_CITIES, Listing, Category } from '../../models/listing.model';
import { GeocodeService, Coords } from '../../services/geocode.service';
import { firstValueFrom } from 'rxjs';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { CityLabelPipe } from '../../pipes/city-label.pipe';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterLink, FormsModule, ListingCardComponent, CitySelectComponent, CatIconComponent, TranslatePipe, CityLabelPipe],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit {
  categories = CATEGORIES;
  cities = MOROCCO_CITIES.slice(0, 12);
  allCities = MOROCCO_CITIES;
  featured: Listing[] = [];
  latest: Listing[] = [];
  searchQuery = '';
  selectedCity = '';
  gpsCoords: Coords | null = null;
  radius = '';
  radiusOptions = ['5', '10', '20', '30', '50', '100', '150', '200'];
  favoriteIds = new Set<string>();
  interests: { category: Category; newListingsCount: number }[] = [];

  stats = [
    { labelKey: 'home.stat_active_listings', value: '50K+' },
    { labelKey: 'home.stat_registered_users', value: '120K+' },
    { labelKey: 'home.stat_cities_covered', value: '50+' },
    { labelKey: 'home.stat_monthly_listings', value: '5K+' },
  ];

  features = [
    { icon: '⚡', titleKey: 'home.feature_fast_title', descKey: 'home.feature_fast_desc', bg: '#fef9c3', color: '#a16207' },
    { icon: '🛡️', titleKey: 'home.feature_secure_title', descKey: 'home.feature_secure_desc', bg: '#dcfce7', color: '#15803d' },
    { icon: '👥', titleKey: 'home.feature_community_title', descKey: 'home.feature_community_desc', bg: '#dbeafe', color: '#1d4ed8' },
    { icon: '📈', titleKey: 'home.feature_boost_title', descKey: 'home.feature_boost_desc', bg: '#f3e8ff', color: '#7e22ce' },
  ];

  constructor(
    private listingService: ListingService,
    private api: ApiService,
    private auth: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private geocodeService: GeocodeService
  ) {}

  ngOnInit() {
    this.cdr.markForCheck();
    this.listingService.getAll({ limit: '20' }).subscribe(res => {
      this.featured = res.listings.filter(l => l.isFeatured);
      this.latest = res.listings.slice(0, 8);
      this.cdr.markForCheck();
    });
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

  onCityChange(value: string) {
    this.selectedCity = value;
    this.gpsCoords = null;
  }

  onGpsSelected(coords: Coords) {
    this.gpsCoords = coords;
    if (!this.radius) this.radius = '10';
  }

  async search() {
    const params: Record<string, string> = {};
    if (this.searchQuery.trim()) params['q'] = this.searchQuery.trim();
    if (this.selectedCity.trim()) params['ville'] = this.selectedCity.trim();

    if (this.gpsCoords) {
      params['lat'] = String(this.gpsCoords.lat);
      params['lng'] = String(this.gpsCoords.lng);
      params['radius'] = this.radius || '10';
    } else if (this.radius && this.selectedCity.trim()) {
      try {
        const coords = await firstValueFrom(this.geocodeService.geocode(this.selectedCity.trim()));
        params['lat'] = String(coords.lat);
        params['lng'] = String(coords.lng);
        params['radius'] = this.radius;
      } catch { /* geocoding failed — fall back to plain city-text search */ }
    }

    this.router.navigate(['/annonces'], { queryParams: params });
  }

  goToCity(city: string) {
    this.router.navigate(['/annonces'], { queryParams: { ville: city } });
  }
}
