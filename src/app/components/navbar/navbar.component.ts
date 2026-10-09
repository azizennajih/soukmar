import { Component, signal, effect, untracked, HostListener, OnInit, OnDestroy, inject, PLATFORM_ID } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LocalizedRouterLinkDirective } from '../../directives/localized-router-link.directive';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';
import { I18nService, Lang } from '../../services/i18n.service';
import { CountryService } from '../../services/country.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { CATEGORIES, MOROCCO_CITIES } from '../../models/listing.model';
import { CITIES_BY_COUNTRY } from '../../models/country.model';
import { CitySelectComponent } from '../city-select/city-select.component';
import { CatIconComponent } from '../cat-icon/cat-icon.component';
import { FlagIconComponent } from '../flag-icon/flag-icon.component';
import { GeocodeService, Coords } from '../../services/geocode.service';
import { NotificationService } from '../../services/notification.service';
import { SearchSuggestionsComponent } from '../search-suggestions/search-suggestions.component';
import { IconComponent } from '../icon/icon.component';
import { ImageSearchService } from '../../services/image-search.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterLink, LocalizedRouterLinkDirective, FormsModule, CitySelectComponent, CatIconComponent, FlagIconComponent, TranslatePipe, SearchSuggestionsComponent, IconComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit, OnDestroy {
  categories = CATEGORIES;
  get cities(): string[] {
    const c = this.countryService.country();
    return c === 'MA' ? MOROCCO_CITIES : (CITIES_BY_COUNTRY[c] ?? []);
  }
  searchQuery = '';
  selectedCity = '';
  selectedCategory = '';
  gpsCoords: Coords | null = null;
  radius = '';
  radiusOptions = ['5', '10', '20', '30', '50', '100', '150', '200'];
  mobileOpen = signal(false);
  userMenuOpen = signal(false);
  unreadCount = signal(0);
  searchFocused = signal(false);
  private pollInterval: ReturnType<typeof setInterval> | null = null;

  // iso = flag image shown next to the language (Windows can't render flag emoji: they show as two letters).
  langs: { code: Lang; iso: string; label: string }[] = [
    { code: 'fr', iso: 'fr', label: 'FR' },
    { code: 'en', iso: 'gb', label: 'EN' },
    { code: 'ar', iso: 'sa', label: 'AR' },
    { code: 'de', iso: 'de', label: 'DE' },
    { code: 'es', iso: 'es', label: 'ES' },
    { code: 'it', iso: 'it', label: 'IT' },
    { code: 'pt', iso: 'br', label: 'PT' },
    { code: 'tr', iso: 'tr', label: 'TR' },
    { code: 'fa', iso: 'ir', label: 'فا' },
    { code: 'ur', iso: 'pk', label: 'اردو' },
    { code: 'ps', iso: 'af', label: 'پښتو' },
  ];

  langMenuOpen = signal(false);

  constructor(public auth: AuthService, private api: ApiService, private router: Router, public i18n: I18nService, public countryService: CountryService, private geocodeService: GeocodeService, public notifService: NotificationService, private imageSearchService: ImageSearchService) {
    this.updatePostQuery(this.router.url);
    // A new browsing country (switched in the footer) invalidates whatever city was picked under the old one.
    effect(() => { this.countryService.country(); untracked(() => { this.selectedCity = ''; this.gpsCoords = null; }); });
    this.router.events.subscribe(e => { if (e instanceof NavigationEnd) this.updatePostQuery(e.urlAfterRedirects); });
  }

  /** On a category's listing page the "post a listing" buttons carry that category,
   * so the wizard doesn't ask for it again. */
  postQuery = signal<Record<string, string>>({});

  private updatePostQuery(url: string) {
    const [path, query = ''] = url.split('#')[0].split('?');
    const category = path.endsWith('/annonces') ? new URLSearchParams(query).get('categorie') : null;
    this.postQuery.set(category && CATEGORIES.some(c => c.value === category) ? { categorie: category } : {});
  }

  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  ngOnInit() {
    // Polling is a browser-only concern — irrelevant (and, with a future
    // server-rendered login state, a wasted interval) during SSR.
    if (this.isBrowser && this.auth.isLoggedIn) this.startPolling();
  }

  ngOnDestroy() {
    if (this.pollInterval) clearInterval(this.pollInterval);
  }

  startPolling() {
    this.fetchUnread();
    this.pollInterval = setInterval(() => this.fetchUnread(), 30000);
  }

  fetchUnread() {
    if (!this.auth.isLoggedIn) return;
    this.api.get<{ count: number }>('/auth/unread-count').subscribe({
      next: res => this.unreadCount.set(res.count),
      error: () => {}
    });
    this.notifService.refreshUnreadCount();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(e: Event) {
    const target = e.target as HTMLElement;
    if (!target.closest('.user-menu-wrapper')) this.userMenuOpen.set(false);
    if (!target.closest('.navbar__lang-wrapper')) this.langMenuOpen.set(false);
  }

  toggleLangMenu(e: Event) { e.stopPropagation(); this.langMenuOpen.update(v => !v); }

  /** Navigates to the same path (and query string) under the new
   * language's URL prefix — LocaleShellComponent then picks up the `:lang`
   * segment from the resulting navigation and syncs I18nService, so the
   * URL and the displayed language never desync. `router.url` always
   * starts with a `/xx` language segment once past the app's initial
   * bare-URL redirect, so a plain regex swap is enough; the fallback below
   * only matters for an edge case where it somehow doesn't. */
  selectLang(code: Lang, e: Event) {
    e.stopPropagation();
    this.langMenuOpen.set(false);
    if (code === this.i18n.lang()) return;
    this.i18n.markLangExplicit();
    const current = this.router.url;
    const match = current.match(/^\/[a-z]{2}(\/.*)?$/);
    const restPath = match ? (match[1] ?? '') : (current.startsWith('/') ? current : `/${current}`);
    this.router.navigateByUrl(`/${code}${restPath}`);
  }

  get activeLang() { return this.langs.find(l => l.code === this.i18n.lang())!; }

  /** "Youssef Amrani" -> "YA" — keeps the navbar compact enough for the
   * search bar; the full name stays available via the button's title tooltip. */
  get userInitials(): string {
    const name = this.auth.currentUser()?.name ?? '';
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return '';
    return parts.length === 1
      ? parts[0][0].toUpperCase()
      : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  onCityChange(value: string) {
    this.selectedCity = value;
    this.gpsCoords = null;
  }

  onGpsSelected(coords: Coords) {
    this.gpsCoords = coords;
    if (!this.radius) this.radius = '10';
  }

  onImageSearchFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.imageSearchService.setPendingFile(file);
      this.router.navigate(this.i18n.withLang(['/recherche-image']));
    }
    input.value = '';
  }

  onSuggestionPick(e: { q: string; category?: string }) {
    this.searchQuery = e.q;
    this.searchFocused.set(false);
    this.search(e.category);
  }

  /** Explicit fallback for Enter in the keyword field: `suggestions.onKeydown()`
   * already handles Enter-with-a-highlighted-suggestion (arrow-key navigated,
   * calls preventDefault + picks it) — this only fires `search()` when that
   * branch did nothing, i.e. no suggestion was highlighted. Written this way
   * (rather than relying on the browser's native implicit-submit-on-Enter)
   * because that native behavior wasn't firing reliably here. */
  onSearchInputKeydown(e: KeyboardEvent, suggestions: SearchSuggestionsComponent) {
    suggestions.onKeydown(e);
    if (e.key === 'Enter' && !e.defaultPrevented) this.search();
  }

  async search(category?: string) {
    const params: Record<string, string> = { pays: this.countryService.country() };
    if (this.searchQuery.trim()) params['q'] = this.searchQuery.trim();
    if (category) params['categorie'] = category;
    if (this.selectedCity.trim()) params['ville'] = this.selectedCity.trim();

    if (this.gpsCoords) {
      params['lat'] = String(this.gpsCoords.lat);
      params['lng'] = String(this.gpsCoords.lng);
      params['radius'] = this.radius || '10';
    } else if (this.radius && this.selectedCity.trim()) {
      try {
        const coords = await firstValueFrom(this.geocodeService.geocode(this.selectedCity.trim(), this.countryService.country()));
        params['lat'] = String(coords.lat);
        params['lng'] = String(coords.lng);
        params['radius'] = this.radius;
      } catch { /* geocoding failed — fall back to plain city-text search */ }
    }

    this.router.navigate(this.i18n.withLang(['/annonces']), { queryParams: params });
  }

  toggleMobile() { this.mobileOpen.update(v => !v); }
  toggleUserMenu(e: Event) { e.stopPropagation(); this.userMenuOpen.update(v => !v); }
  logout() { this.auth.logout(); this.userMenuOpen.set(false); this.unreadCount.set(0); }
}
