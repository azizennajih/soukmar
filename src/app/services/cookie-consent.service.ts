import { Injectable, signal, inject } from '@angular/core';
import { BrowserStorageService } from './browser-storage.service';

const CONSENT_KEY = 'soukmar_cookie_consent';

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

  consent = signal<CookieConsentChoice | null>(
    this.storage.getItem(CONSENT_KEY) as CookieConsentChoice | null
  );

  choose(choice: CookieConsentChoice) {
    this.consent.set(choice);
    this.storage.setItem(CONSENT_KEY, choice);
  }
}
