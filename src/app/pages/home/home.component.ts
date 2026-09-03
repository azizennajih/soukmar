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
import { CATEGORIES, MOROCCO_CITIES, Listing } from '../../models/listing.model';
import { GeocodeService, Coords } from '../../services/geocode.service';
import { firstValueFrom } from 'rxjs';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterLink, FormsModule, ListingCardComponent, CitySelectComponent, TranslatePipe],
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

  stats = [
    { label: 'Annonces actives', value: '50K+' },
    { label: 'Utilisateurs inscrits', value: '120K+' },
    { label: 'Villes couvertes', value: '50+' },
    { label: 'Annonces / mois', value: '5K+' },
  ];

  features = [
    { icon: '⚡', title: 'Rapide & Simple', desc: 'Publiez votre annonce en moins de 2 minutes', bg: '#fef9c3', color: '#a16207' },
    { icon: '🛡️', title: '100% Sécurisé', desc: 'Toutes les annonces sont vérifiées par notre équipe', bg: '#dcfce7', color: '#15803d' },
    { icon: '👥', title: 'Grande communauté', desc: 'Plus de 120,000 acheteurs et vendeurs actifs', bg: '#dbeafe', color: '#1d4ed8' },
    { icon: '📈', title: 'Boostez vos ventes', desc: 'Options premium pour maximiser la visibilité', bg: '#f3e8ff', color: '#7e22ce' },
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
    if (this.auth.isLoggedIn) this.loadFavorites();
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
