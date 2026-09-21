import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ListingService } from '../../services/listing.service';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { CatalogService } from '../../services/catalog.service';
import { GeocodeService, Coords } from '../../services/geocode.service';
import { ListingCardComponent } from '../../components/listing-card/listing-card.component';
import { ListingsMapComponent } from '../../components/listings-map/listings-map.component';
import { CitySelectComponent } from '../../components/city-select/city-select.component';
import { CatIconComponent } from '../../components/cat-icon/cat-icon.component';
import { IconComponent } from '../../components/icon/icon.component';
import { MultiSelectComponent } from '../../components/multi-select/multi-select.component';
import { TextAutocompleteComponent } from '../../components/text-autocomplete/text-autocomplete.component';
import { CATEGORIES, MOROCCO_CITIES, Listing, Category, AttributeDefinition, JOB_PROFESSION_CODES, JOB_PROFESSIONS_BY_SECTOR, CONDITION_CATEGORIES, NO_CONDITION_SUBCATEGORIES, SHOE_SIZES_EU } from '../../models/listing.model';
import { CITIES_BY_COUNTRY } from '../../models/country.model';
import { CountryService } from '../../services/country.service';
import { firstValueFrom } from 'rxjs';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { SavedSearchService } from '../../services/saved-search.service';
import { SeoService, SITE_URL } from '../../services/seo.service';

interface SubcategoryOption { id: string; code: string; }

@Component({
  selector: 'app-annonces',
  imports: [CommonModule, RouterLink, FormsModule, ListingCardComponent, ListingsMapComponent, CitySelectComponent, CatIconComponent, MultiSelectComponent, TextAutocompleteComponent, TranslatePipe, IconComponent],
  templateUrl: './annonces.component.html',
  styleUrl: './annonces.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnnoncesComponent implements OnInit {
  categories = CATEGORIES;
  get cities(): string[] {
    const c = this.filters.pays || this.countryService.country();
    return c === 'MA' ? MOROCCO_CITIES : (CITIES_BY_COUNTRY[c] ?? []);
  }
  shoeSizes = SHOE_SIZES_EU;
  radiusOptions = ['5', '10', '20', '30', '50', '100', '150', '200'];
  listings: Listing[] = [];
  viewMode: 'list' | 'map' = 'list';
  filterOpen = false;
  total = 0;
  loading = false;
  favoriteIds = new Set<string>();

  subcategoryOptions: SubcategoryOption[] = [];
  attributeFilterDefs: AttributeDefinition[] = [];
  /** Category/subcategory-specific sort options (e.g. mileage, first
   * registration year for vehicles) — only the attributes the catalog
   * marks `sortable`, same union-across-subcategories logic as
   * `attributeFilterDefs`. Empty outside a selected category. */
  sortableAttributeDefs: AttributeDefinition[] = [];
  attrFilters: Record<string, string> = {};
  get jobProfessionCodes(): string[] {
    const sectors = this.selectedOptions('INDUSTRY');
    if (!sectors.length) return JOB_PROFESSION_CODES;
    return [...new Set(sectors.flatMap(s => JOB_PROFESSIONS_BY_SECTOR[s] ?? []))];
  }

  /** Hides the Zustand (Neu/Gebraucht) filter for categories/subcategories
   * where it makes no sense — e.g. services like Trainingsangebote never
   * have a condition, even though their category (Sport & Freizeit) is
   * otherwise full of physical goods. */
  get showCondition(): boolean {
    if (!this.filters.categorie || !CONDITION_CATEGORIES.includes(this.filters.categorie as Category)) return false;
    const sub = this.subcategoryOptions.find(s => s.id === this.filters.souscategorie);
    return !sub || !NO_CONDITION_SUBCATEGORIES.includes(sub.code);
  }

  filters = { q: '', categorie: '', souscategorie: '', ville: '', minPrix: '', maxPrix: '', condition: '', tri: '', radius: '', lat: '', lng: '', accountType: '', intent: '', pays: '' };

  showSaveSearchForm = false;
  newSearchName = '';
  searchSaved = false;
  savingSearch = false;
  editSearchId: string | null = null;

  /** Skips the effect's first firing — the initial load already goes
   * through the queryParams subscription below, so this only reacts to a
   * *later* switch of the navbar's country dropdown while already on this
   * page (no navigation happens in that case, so queryParams never refires). */
  private countryEffectRan = false;

  constructor(
    private listingService: ListingService,
    private catalog: CatalogService,
    private geocodeService: GeocodeService,
    private route: ActivatedRoute,
    private router: Router,
    private api: ApiService,
    public auth: AuthService,
    private cdr: ChangeDetectorRef,
    private savedSearchService: SavedSearchService,
    public countryService: CountryService,
    private seo: SeoService
  ) {
    effect(() => {
      const country = this.countryService.country();
      if (!this.countryEffectRan) { this.countryEffectRan = true; return; }
      this.filters.pays = country;
      this.loadListings();
    });
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.filters.q             = params['q']             || '';
      this.filters.categorie     = params['categorie']     || '';
      this.filters.souscategorie = params['souscategorie'] || '';
      this.filters.ville         = params['ville']         || '';
      this.filters.minPrix       = params['minPrix']       || '';
      this.filters.maxPrix       = params['maxPrix']       || '';
      this.filters.condition     = params['condition']     || '';
      this.filters.accountType  = params['accountType']    || '';
      this.filters.intent        = params['intent']        || '';
      this.filters.pays          = params['pays']           || this.countryService.country();
      this.filters.tri           = params['tri']           || '';
      this.filters.radius        = params['radius']        || '';
      this.filters.lat           = params['lat']            || '';
      this.filters.lng           = params['lng']            || '';
      this.attrFilters = {};
      for (const key of Object.keys(params)) {
        if (key.startsWith('attr_')) this.attrFilters[key] = params[key];
      }
      if (params['editSearch']) {
        this.editSearchId = params['editSearch'];
        this.newSearchName = params['editSearchName'] || '';
        this.showSaveSearchForm = true;
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
      this.sortableAttributeDefs = [];
      return;
    }
    this.catalog.getCategoryFull(this.filters.categorie as Category).subscribe({
      next: res => {
        this.subcategoryOptions = res.subcategories.map(s => ({ id: s.id, code: s.code }));
        const selected = res.subcategories.find(s => s.id === this.filters.souscategorie);
        const defs = selected
          ? selected.attributeDefinitions
          : res.subcategories.flatMap(s => s.attributeDefinitions);
        const seenFilter = new Set<string>();
        this.attributeFilterDefs = defs.filter(d => d.filterable && !seenFilter.has(d.code) && seenFilter.add(d.code));
        const seenSort = new Set<string>();
        this.sortableAttributeDefs = defs.filter(d => d.sortable && !seenSort.has(d.code) && seenSort.add(d.code));
        // A category switch can drop the previously selected sort attribute
        // (e.g. leaving Véhicules while sorted by mileage) — fall back to
        // the default sort instead of silently sending a dead `tri` value.
        if (this.filters.tri.startsWith('attr_') && !this.sortableAttributeDefs.some(d => this.filters.tri === `attr_${d.code}_asc` || this.filters.tri === `attr_${d.code}_desc`)) {
          this.filters.tri = '';
        }
        this.cdr.markForCheck();
      },
      error: () => { this.subcategoryOptions = []; this.attributeFilterDefs = []; this.sortableAttributeDefs = []; this.cdr.markForCheck(); }
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
      accountType:   this.filters.accountType   || undefined,
      intent:        this.filters.intent        || undefined,
      country:       this.filters.pays          || undefined,
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
        this.updateSeo();
        this.cdr.markForCheck();
      },
      error: () => { this.loading = false; this.cdr.markForCheck(); }
    });
  }

  // Faceted-navigation SEO fix: sort/price/city/etc. produce endless
  // near-duplicate URLs for the same underlying result set, which Google
  // would otherwise index as separate thin pages. Canonicalize to the one
  // real landing page this search reduces to — the category alone (a
  // genuine, worth-indexing page) if one is selected, /annonces otherwise —
  // and drop every other filter from both the canonical URL and og:url.
  private updateSeo() {
    const catLabel = this.filters.categorie ? `${this.filters.categorie} — ` : '';
    this.seo.setTitleAndDescription(
      `${catLabel}Annonces — SouqMar24`,
      `${this.total} annonces disponibles sur SouqMar24.`
    );
    const canonicalPath = this.filters.categorie
      ? `/annonces?categorie=${encodeURIComponent(this.filters.categorie)}`
      : '/annonces';
    this.seo.setCanonical(`${SITE_URL}${canonicalPath}`);
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
    const qp: Record<string, string> = { pays: this.filters.pays || this.countryService.country() };
    if (this.filters.q)             qp['q']             = this.filters.q;
    if (this.filters.categorie)     qp['categorie']     = this.filters.categorie;
    if (this.filters.souscategorie) qp['souscategorie'] = this.filters.souscategorie;
    if (this.filters.ville)         qp['ville']         = this.filters.ville;
    if (this.filters.minPrix)       qp['minPrix']       = this.filters.minPrix;
    if (this.filters.maxPrix)       qp['maxPrix']       = this.filters.maxPrix;
    if (this.filters.condition)     qp['condition']     = this.filters.condition;
    if (this.filters.accountType)   qp['accountType']   = this.filters.accountType;
    if (this.filters.intent)        qp['intent']        = this.filters.intent;
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
    const pays = this.countryService.country();
    this.filters = { q: '', categorie: '', souscategorie: '', ville: '', minPrix: '', maxPrix: '', condition: '', tri: '', radius: '', lat: '', lng: '', accountType: '', intent: '', pays };
    this.attrFilters = {};
    this.router.navigate([], { queryParams: { pays } });
  }

  get activeCategory() {
    return this.categories.find(c => c.value === this.filters.categorie);
  }

  saveSearch() {
    if (!this.newSearchName.trim() || this.savingSearch) return;
    const attrs: Record<string, string[]> = {};
    for (const [key, val] of Object.entries(this.attrFilters)) {
      if (!val || key.endsWith('_min') || key.endsWith('_max')) continue;
      const code = key.replace(/^attr_/, '');
      attrs[code] = val.split(',').filter(Boolean);
    }
    const data = {
      name: this.newSearchName.trim(),
      category: (this.filters.categorie || undefined) as Category | undefined,
      subcategoryId: this.filters.souscategorie || undefined,
      q: this.filters.q || undefined,
      city: this.filters.ville || undefined,
      minPrice: this.filters.minPrix ? parseFloat(this.filters.minPrix) : undefined,
      maxPrice: this.filters.maxPrix ? parseFloat(this.filters.maxPrix) : undefined,
      condition: (this.filters.condition || undefined) as any,
      attrs: Object.keys(attrs).length ? attrs : undefined
    };
    this.savingSearch = true;
    const req$ = this.editSearchId ? this.savedSearchService.update(this.editSearchId, data) : this.savedSearchService.create(data);
    req$.subscribe({
      next: () => {
        this.savingSearch = false;
        this.showSaveSearchForm = false;
        this.newSearchName = '';
        if (this.editSearchId) {
          this.router.navigate(['/recherches-sauvegardees']);
          return;
        }
        this.searchSaved = true;
        this.cdr.markForCheck();
        setTimeout(() => { this.searchSaved = false; this.cdr.markForCheck(); }, 3000);
      },
      error: () => { this.savingSearch = false; this.cdr.markForCheck(); }
    });
  }

  cancelSaveSearch() {
    if (this.editSearchId) { this.router.navigate(['/recherches-sauvegardees']); return; }
    this.showSaveSearchForm = false;
  }
}
