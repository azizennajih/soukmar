import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LocalizedRouterLinkDirective } from '../../directives/localized-router-link.directive';
import { CookieConsentService, CookieConsentChoice } from '../../services/cookie-consent.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

/** Fixed bottom bar shown once, on any visitor's first visit, until they
 * pick a choice (see CookieConsentService — a single global choice, no
 * per-category toggles, since the site has nothing non-essential to
 * actually categorize yet). Rendered app-wide from app.ts, next to
 * app-navbar/app-footer. */
@Component({
  selector: 'app-cookie-consent-banner',
  imports: [CommonModule, RouterLink, LocalizedRouterLinkDirective, TranslatePipe],
  templateUrl: './cookie-consent-banner.component.html',
  styleUrl: './cookie-consent-banner.component.scss'
})
export class CookieConsentBannerComponent {
  cookieConsent = inject(CookieConsentService);

  choose(choice: CookieConsentChoice) {
    this.cookieConsent.choose(choice);
  }
}
