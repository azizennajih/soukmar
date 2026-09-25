import { Injectable, signal, computed, effect, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BrowserStorageService } from './browser-storage.service';
import { AuthService } from './auth.service';
import { isKnownCountry } from '../models/country.model';

const COUNTRY_KEY = 'soukmar_country';

/** The country a visitor is browsing/listing in — deliberately independent
 * of I18nService (country ≠ language: a French speaker might browse
 * Morocco, an Arabic speaker might browse France). Persisted the same way
 * as the language choice: browser-local only, not tied to the account. */
@Injectable({ providedIn: 'root' })
export class CountryService {
  private storage = inject(BrowserStorageService);
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  /** Only ADMINs may switch the browsing country manually (navbar dropdown).
   * Everyone else sees a fixed country they cannot change: IP-detected while
   * logged out, or the one chosen at registration once logged in — see the
   * navbar's read-only badge vs. active dropdown. */
  canSwitchCountry = computed(() => this.auth.currentUser()?.role === 'ADMIN');

  /** Captured before any write happens, so we know whether this is a
   * genuinely first-ever visit (no preference saved yet) vs. a returning
   * visitor whose choice — including an explicit 'MA' — must never be
   * silently overridden by IP detection. */
  private hadStoredPreference = this.storage.getItem(COUNTRY_KEY) !== null;

  country = signal<string>(
    isKnownCountry(this.storage.getItem(COUNTRY_KEY) ?? '')
      ? this.storage.getItem(COUNTRY_KEY)!
      : 'MA'
  );

  constructor() {
    effect(() => this.storage.setItem(COUNTRY_KEY, this.country()));
    if (this.isBrowser && !this.hadStoredPreference) this.detectCountryFromIp();
    // Pins the browsing country to the account's stored one on login (and
    // whenever currentUser changes, e.g. across tabs); logging out or being
    // an ADMIN leaves the free localStorage-based choice untouched.
    effect(() => {
      const u = this.auth.currentUser();
      if (u && u.role !== 'ADMIN') this.country.set(u.country);
    });
  }

  /** Manual switch, gated to ADMINs only — the navbar only calls this from
   * the interactive dropdown, which itself is only rendered for ADMINs, but
   * this guard is the actual enforcement (defense in depth). */
  setCountry(code: string) {
    if (!this.canSwitchCountry()) return;
    this.country.set(code);
  }

  /** Best-effort: on a first-ever visit (nothing in localStorage yet), ask a
   * free IP-geolocation lookup which country the visitor is browsing from
   * and pre-select it, instead of always defaulting to Morocco. Silently
   * keeps the 'MA' default on any failure (network error, unknown/unsupported
   * country code, ad-blocker) — this is a convenience default, not something
   * worth showing an error for. Sets the signal directly (not via
   * setCountry()) since this is automatic, not a manual switch, and must
   * still run for logged-out visitors even though they can't switch by hand. */
  private detectCountryFromIp() {
    this.http.get<{ country_code?: string }>('https://ipapi.co/json/').subscribe({
      next: (res) => {
        const code = res.country_code?.toUpperCase();
        if (code && isKnownCountry(code)) this.country.set(code);
      },
      error: () => {},
    });
  }
}
