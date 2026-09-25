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

  country = signal<string>(
    isKnownCountry(this.storage.getItem(COUNTRY_KEY) ?? '')
      ? this.storage.getItem(COUNTRY_KEY)!
      : 'MA'
  );

  constructor() {
    effect(() => this.storage.setItem(COUNTRY_KEY, this.country()));
    // Pins the browsing country to the account's stored one for regular
    // users on login. For anyone NOT logged in — a fresh visit, or right
    // after logging out — always re-detects via IP instead, since they have
    // no way to set a preference manually: a stale value left in
    // localStorage from a previous account's pinned country (or an earlier
    // ADMIN's manual pick in this same browser) must never linger past
    // logout. Re-runs whenever currentUser() itself changes (login/logout),
    // not on every reload while already logged in as the same user/admin —
    // an ADMIN's own manual choice is left untouched.
    effect(() => {
      const u = this.auth.currentUser();
      if (u && u.role !== 'ADMIN') {
        this.country.set(u.country);
      } else if (!u && this.isBrowser) {
        this.detectCountryFromIp();
      }
    });
  }

  /** Manual switch, gated to ADMINs only — the navbar only calls this from
   * the interactive dropdown, which itself is only rendered for ADMINs, but
   * this guard is the actual enforcement (defense in depth). */
  setCountry(code: string) {
    if (!this.canSwitchCountry()) return;
    this.country.set(code);
  }

  /** Best-effort: asks a free IP-geolocation lookup which country the visitor
   * is browsing from and pre-selects it, instead of defaulting to (or
   * leaking) some other value. Silently keeps whatever value was already
   * there on any failure (network error, unknown/unsupported country code,
   * ad-blocker) — this is a convenience default, not something worth
   * showing an error for. Sets the signal directly (not via setCountry())
   * since this is automatic, not a manual switch, and must still run for
   * logged-out visitors even though they can't switch by hand. */
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
