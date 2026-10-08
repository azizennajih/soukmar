import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LocalizedRouterLinkDirective } from '../../directives/localized-router-link.directive';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { CATEGORY_GROUPS } from '../../models/listing.model';
import { countryName, VISIBLE_COUNTRY_REGIONS } from '../../models/country.model';
import { FlagIconComponent } from '../flag-icon/flag-icon.component';
import { AuthService } from '../../services/auth.service';
import { IconComponent } from '../icon/icon.component';
import { I18nService } from '../../services/i18n.service';
import { CountryService } from '../../services/country.service';
import { CookieConsentService } from '../../services/cookie-consent.service';

@Component({
  selector: 'app-footer',
  imports: [RouterLink, LocalizedRouterLinkDirective, TranslatePipe, IconComponent, FlagIconComponent],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {
  year = new Date().getFullYear();
  readonly categoryGroups = CATEGORY_GROUPS;
  countryName = countryName;
  readonly countryRegions = VISIBLE_COUNTRY_REGIONS;

  regionLabelKey(region: string): string {
    return 'deposer.region_' + region.toLowerCase();
  }

  /** Only admins can switch the browsing country; everyone else sees the detected/fixed one. */
  onCountryChange(code: string) {
    this.countryService.setCountry(code);
  }

  constructor(
    public i18n: I18nService,
    public countryService: CountryService,
    public auth: AuthService,
    public cookieConsent: CookieConsentService
  ) {}
}
