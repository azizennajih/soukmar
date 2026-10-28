import { Component, HostListener, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LocalizedRouterLinkDirective } from '../../directives/localized-router-link.directive';
import { CookieConsentService, CookieConsentChoice } from '../../services/cookie-consent.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

/** Fixed bottom bar shown on a visitor's first visit until they pick a choice, plus the settings dialog
 * (per-category choice, also opened from the footer link so the choice can be changed any time).
 * Rendered app-wide from app.ts, next to app-navbar/app-footer. */
@Component({
  selector: 'app-cookie-consent-banner',
  imports: [CommonModule, RouterLink, LocalizedRouterLinkDirective, TranslatePipe],
  templateUrl: './cookie-consent-banner.component.html',
  styleUrl: './cookie-consent-banner.component.scss'
})
export class CookieConsentBannerComponent {
  cookieConsent = inject(CookieConsentService);
  /** Toggle state inside the open dialog; starts from the saved choice each time it opens. */
  analytics = signal(false);

  choose(choice: CookieConsentChoice) {
    this.cookieConsent.choose(choice);
  }

  openSettings() {
    this.analytics.set(this.cookieConsent.analyticsAllowed);
    this.cookieConsent.openSettings();
  }

  saveSettings() {
    this.cookieConsent.choose(this.analytics() ? 'all' : 'essential');
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    if (this.cookieConsent.settingsOpen()) this.cookieConsent.closeSettings();
  }
}
