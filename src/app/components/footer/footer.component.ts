import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LocalizedRouterLinkDirective } from '../../directives/localized-router-link.directive';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { CATEGORIES } from '../../models/listing.model';
import { countryName } from '../../models/country.model';
import { IconComponent } from '../icon/icon.component';
import { I18nService } from '../../services/i18n.service';
import { CountryService } from '../../services/country.service';

@Component({
  selector: 'app-footer',
  imports: [RouterLink, LocalizedRouterLinkDirective, TranslatePipe, IconComponent],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {
  year = new Date().getFullYear();
  readonly categories = CATEGORIES;
  countryName = countryName;

  constructor(public i18n: I18nService, public countryService: CountryService) {}
}
