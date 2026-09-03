import { Component, signal, HostListener, OnInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';
import { I18nService, Lang } from '../../services/i18n.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { CATEGORIES, MOROCCO_CITIES } from '../../models/listing.model';
import { CitySelectComponent } from '../city-select/city-select.component';
import { Coords } from '../../services/geocode.service';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterLink, FormsModule, CitySelectComponent, TranslatePipe],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit, OnDestroy {
  categories = CATEGORIES;
  cities = MOROCCO_CITIES;
  searchQuery = '';
  selectedCity = '';
  selectedCategory = '';
  gpsCoords: Coords | null = null;
  mobileOpen = signal(false);
  userMenuOpen = signal(false);
  unreadCount = signal(0);
  private pollInterval: ReturnType<typeof setInterval> | null = null;

  langs: { code: Lang; flag: string; label: string }[] = [
    { code: 'fr', flag: '🇫🇷', label: 'FR' },
    { code: 'en', flag: '🇬🇧', label: 'EN' },
    { code: 'ar', flag: '🇲🇦', label: 'عر' },
    { code: 'de', flag: '🇩🇪', label: 'DE' },
    { code: 'es', flag: '🇪🇸', label: 'ES' },
    { code: 'it', flag: '🇮🇹', label: 'IT' },
  ];

  langMenuOpen = signal(false);

  constructor(public auth: AuthService, private api: ApiService, private router: Router, public i18n: I18nService) {}

  ngOnInit() {
    if (this.auth.isLoggedIn) this.startPolling();
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
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(e: Event) {
    const target = e.target as HTMLElement;
    if (!target.closest('.user-menu-wrapper')) this.userMenuOpen.set(false);
    if (!target.closest('.navbar__lang-wrapper')) this.langMenuOpen.set(false);
  }

  toggleLangMenu(e: Event) { e.stopPropagation(); this.langMenuOpen.update(v => !v); }
  selectLang(code: Lang, e: Event) { e.stopPropagation(); this.i18n.setLang(code); this.langMenuOpen.set(false); }

  get activeLang() { return this.langs.find(l => l.code === this.i18n.lang())!; }

  onCityChange(value: string) {
    this.selectedCity = value;
    this.gpsCoords = null;
  }

  onGpsSelected(coords: Coords) {
    this.gpsCoords = coords;
  }

  search() {
    const params: Record<string, string> = {};
    if (this.searchQuery.trim()) params['q'] = this.searchQuery.trim();
    if (this.gpsCoords) {
      params['ville'] = this.selectedCity.trim();
      params['lat'] = String(this.gpsCoords.lat);
      params['lng'] = String(this.gpsCoords.lng);
      params['radius'] = '10';
    } else if (this.selectedCity.trim()) {
      params['ville'] = this.selectedCity.trim();
    }
    this.router.navigate(['/annonces'], { queryParams: params });
  }

  toggleMobile() { this.mobileOpen.update(v => !v); }
  toggleUserMenu(e: Event) { e.stopPropagation(); this.userMenuOpen.update(v => !v); }
  logout() { this.auth.logout(); this.userMenuOpen.set(false); this.unreadCount.set(0); }
}
