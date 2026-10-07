import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LocalizedRouterLinkDirective } from '../../directives/localized-router-link.directive';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { I18nService } from '../../services/i18n.service';
import { OperatorService } from '../../services/operator.service';

@Component({
  selector: 'app-mentions-legales',
  imports: [CommonModule, RouterLink, LocalizedRouterLinkDirective, TranslatePipe],
  templateUrl: './mentions-legales.component.html',
  styleUrl: './mentions-legales.component.scss'
})
export class MentionsLegalesComponent {
  private i18n = inject(I18nService);
  private operator = inject(OperatorService);
  noticeSections = Array.from({ length: 7 }, (_, i) => i + 1);

  constructor() { this.operator.load(); }

  /** Body text with the provider's details filled in. */
  text(key: string): string { return this.operator.fill(this.i18n.t(key)); }
}
