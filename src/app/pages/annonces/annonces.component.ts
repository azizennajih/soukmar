import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ListingService } from '../../services/listing.service';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { CatalogService } from '../../services/catalog.service';
import { GeocodeService, Coords } from '../../services/geocode.service';
import { ListingCardComponent } from '../../components/listing-card/listing-card.component';
import { CitySelectComponent } from '../../components/city-select/city-select.component';
import { CatIconComponent } from '../../components/cat-icon/cat-icon.component';
import { MultiSelectComponent } from '../../components/multi-select/multi-select.component';
import { CATEGORIES, MOROCCO_CITIES, Listing, Category, AttributeDefinition } from '../../models/listing.model';
import { firstValueFrom } from 'rxjs';
import { TranslatePipe } from '../../pipes/translate.pipe';

interface SubcategoryOption { id: string; code: string; }

@Component({
  selector: 'app-annonces',
  imports: [CommonModule, RouterLink, FormsModule, ListingCardComponent, CitySelectComponent, CatIconComponent, MultiSelectComponent, TranslatePipe],
  templateUrl: './annonces.component.html',
  styleUrl: './annonces.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnnoncesComponent implements OnInit {
  categories = CATEGORIES;
  cities = MOROCCO_CITIES;
  radiusOptions = ['5', '10', '20', '30', '50', '100', '150', '200'];
  listings: Listing[] = [];
  filterOpen = false;
  total = 0;
  loading = false;
  favoriteIds = new Set<string>();

  subcategoryOptions: SubcategoryOption[] = [];
  attributeFilterDefs: AttributeDefinition[] = [];
  attrFilters: Record<string, string> = {};

  filters = { q: '', categorie: '', souscategorie: '', ville: '', minPrix: '', maxPrix: '', condition: '', tri: '', radius: '', lat: '', lng: '' };

  constructor(
    private listingService: ListingService,
    private catalog: CatalogService,
    private geocodeService: GeocodeService,
    private route: ActivatedRoute,
    private router: Router,
    private api: ApiService,
    private auth: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.filters.q             = params['q']             || '';
      this.filters.categorie     = params['categorie']     || '';
      this.filters.souscategorie = params['souscategorie'] || '';
      this.filters.ville         = params['ville']         || '';
      this.filters.minPrix       = params['minPrix']       || '';
      this.filters.maxPrix       = params['maxPrix']       || '';
      this.filters.condition     = params['condition']     || '';
      this.filters.tri           = params['tri']           || '';
      this.filters.radius        = params['radius']        || '';
      this.filters.lat           = params['lat']            || '';
      this.filters.lng           = params['lng']            || '';
      this.attrFilters = {};
      for (const key of Object.keys(params)) {
        if (key.startsWith('attr_')) this.attrFilters[key] = params[key];
      }
      this.loadCatalogForCategory();
      this.loadListings();
    });
    if (this.auth.isLoggedIn) this.loadFavorites();
  }

  loadCatalogForCategory() {
    if (!this.filters.categorie) {
      this.subcategoryOptions = [];
      this.attributeFilterDefs = [];
      return;
    }
    this.catalog.getCategoryFull(this.filters.categorie as Category).subscribe({
      next: res => {
        this.subcategoryOptions = res.subcategories.map(s => ({ id: s.id, code: s.code }));
        const selected = res.subcategories.find(s => s.id === this.filters.souscategorie);
        const defs = selected
          ? selected.attributeDefinitions
          : res.subcategories.flatMap(s => s.attributeDefinitions);
        const seen = new Set<string>();
        this.attributeFilterDefs = defs.filter(d => d.filterable && !seen.has(d.code) && seen.add(d.code));
        this.cdr.markForCheck();
      },
      error: () => { this.subcategoryOptions = []; this.attributeFilterDefs = []; this.cdr.markForCheck(); }
    });
  }

  async loadFavorites() {
    try {
      const favs = await firstValueFrom(this.api.get<Listing[]>('/favorites'));
      this.favoriteIds = new Set(favs.map(f => f.id));
    } catch { /* silently ignore */ }
  }

  loadListings() {
    this.loading = true;
    this.listingService.getAll({
      q:             this.filters.q             || undefined,
      category:      this.filters.categorie     || undefined,
      subcategoryId: this.filters.souscategorie || undefined,
      condition:     this.filters.condition     || undefined,
      city:          this.filters.ville         || undefined,
      minPrice:      this.filters.minPrix       || undefined,
      maxPrice:      this.filters.maxPrix       || undefined,
      lat:           this.filters.lat           || undefined,
      lng:           this.filters.lng           || undefined,
      radius:        this.filters.radius        || undefined,
      tri:           this.filters.tri           || undefined,
      attrs:         this.attrFilters,
    }).subscribe({
      next: res => {
        this.listings = res.listings;
        this.total = res.total;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => { this.loading = false; this.cdr.markForCheck(); }
    });
  }

  isFav(listing: Listing): boolean {
    return this.favoriteIds.has(listing.id);
  }

  onCityChange(value: string) {
    this.filters.ville = value;
    this.filters.lat = '';
    this.filters.lng = '';
  }

  onGpsSelected(coords: Coords) {
    this.filters.lat = String(coords.lat);
    this.filters.lng = String(coords.lng);
    if (!this.filters.radius) this.filters.radius = '10';
  }

  selectOptionValue(code: string, option: string, checked: boolean) {
    const key = `attr_${code}`;
    const current = this.attrFilters[key] ? this.attrFilters[key]!.split(',').filter(Boolean) : [];
    const next = checked ? [...new Set([...current, option])] : current.filter(v => v !== option);
    if (next.length) this.attrFilters[key] = next.join(',');
    else delete this.attrFilters[key];
  }

  isOptionChecked(code: string, option: string): boolean {
    return (this.attrFilters[`attr_${code}`] ?? '').split(',').includes(option);
  }

  selectedOptions(code: string): string[] {
    return (this.attrFilters[`attr_${code}`] ?? '').split(',').filter(Boolean);
  }

  setOptionValues(code: string, values: string[]) {
    const key = `attr_${code}`;
    if (values.length) this.attrFilters[key] = values.join(',');
    else delete this.attrFilters[key];
  }

  setBoolFilter(code: string, checked: boolean) {
    const key = `attr_${code}`;
    if (checked) this.attrFilters[key] = 'true';
    else delete this.attrFilters[key];
  }

  setRangeFilter(code: string, bound: 'min' | 'max', value: string) {
    const key = `attr_${code}_${bound}`;
    if (value) this.attrFilters[key] = value;
    else delete this.attrFilters[key];
  }

  setTextFilter(code: string, value: string) {
    const key = `attr_${code}`;
    if (value) this.attrFilters[key] = value;
    else delete this.attrFilters[key];
  }

  async applyFilters() {
    const qp: Record<string, string> = {};
    if (this.filters.q)             qp['q']             = this.filters.q;
    if (this.filters.categorie)     qp['categorie']     = this.filters.categorie;
    if (this.filters.souscategorie) qp['souscategorie'] = this.filters.souscategorie;
    if (this.filters.ville)         qp['ville']         = this.filters.ville;
    if (this.filters.minPrix)       qp['minPrix']       = this.filters.minPrix;
    if (this.filters.maxPrix)       qp['maxPrix']       = this.filters.maxPrix;
    if (this.filters.condition)     qp['condition']     = this.filters.condition;
    if (this.filters.tri)           qp['tri']           = this.filters.tri;

    if (this.filters.lat && this.filters.lng) {
      qp['lat'] = this.filters.lat;
      qp['lng'] = this.filters.lng;
      qp['radius'] = this.filters.radius || '10';
    } else if (this.filters.radius && this.filters.ville) {
      try {
        const coords = await firstValueFrom(this.geocodeService.geocode(this.filters.ville));
        qp['lat'] = String(coords.lat);
        qp['lng'] = String(coords.lng);
        qp['radius'] = this.filters.radius;
      } catch { /* geocoding failed — fall back to plain city-text search */ }
    }

    for (const [k, v] of Object.entries(this.attrFilters)) { if (v) qp[k] = v; }
    this.router.navigate([], { queryParams: qp });
  }

  resetFilters() {
    this.filters = { q: '', categorie: '', souscategorie: '', ville: '', minPrix: '', maxPrix: '', condition: '', tri: '', radius: '', lat: '', lng: '' };
    this.attrFilters = {};
    this.router.navigate([], { queryParams: {} });
  }

  get activeCategory() {
    return this.categories.find(c => c.value === this.filters.categorie);
  }
}
