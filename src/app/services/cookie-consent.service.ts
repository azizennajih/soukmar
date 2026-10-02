import { Injectable, signal, inject, PLATFORM_ID, REQUEST } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BrowserStorageService } from './browser-storage.service';

const CONSENT_KEY = 'soukmar_cookie_consent';
const CONSENT_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

export type CookieConsentChoice = 'all' | 'essential';

/** GDPR-style cookie/localStorage consent — a single global choice (no
 * per-category toggles) since the site currently only uses essential
 * storage (auth session, language/country preference) and no third-party
 * trackers to actually categorize; "essential" vs "all" leaves room to
 * gate a future analytics/marketing script behind consent() === 'all'
 * without redesigning this service. `null` means no choice made yet —
 * the banner (app-cookie-consent-banner) shows until one is picked. */
@Injectable({ providedIn: 'root' })
export class CookieConsentService {
  private storage = inject(BrowserStorageService);
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  /** Only populated during SSR — the server has no localStorage, so without
   * the cookie mirror it would always render the banner and the browser
   * would then hide it again after hydration (a visible flash on reload). */
  private request = inject(REQUEST, { optional: true });

  consent = signal<CookieConsentChoice | null>(this.readInitialConsent());

  constructor() {
    // Visitors who chose before the cookie mirror existed only have the
    // localStorage value — back-fill the cookie so their next reload is flash-free.
    const current = this.consent();
    if (this.isBrowser && current) this.writeCookie(current);
  }

  choose(choice: CookieConsentChoice) {
    this.consent.set(choice);
    this.storage.setItem(CONSENT_KEY, choice);
    this.writeCookie(choice);
  }

  /** Re-opens the banner so a visitor can change an earlier choice (footer
   * "Manage cookie settings" link) — mirrors the withdraw-as-easy-as-give rule. */
  reopen() {
    this.consent.set(null);
    this.storage.removeItem(CONSENT_KEY);
    this.writeCookie(null);
  }

  private readInitialConsent(): CookieConsentChoice | null {
    const raw = this.isBrowser ? this.storage.getItem(CONSENT_KEY) : this.readFromRequestCookie();
    return raw === 'all' || raw === 'essential' ? raw : null;
  }

  private readFromRequestCookie(): string | null {
    const cookieHeader = this.request?.headers.get('cookie');
    if (!cookieHeader) return null;
    const match = cookieHeader.match(/(?:^|;\s*)soukmar_cookie_consent=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : null;
  }

  private writeCookie(choice: CookieConsentChoice | null) {
    if (!this.isBrowser) return;
    const maxAge = choice ? CONSENT_COOKIE_MAX_AGE : 0;
    document.cookie = `${CONSENT_KEY}=${choice ?? ''}; path=/; max-age=${maxAge}; samesite=lax`;
  }
}
