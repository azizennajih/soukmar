import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LocalizedRouterLinkDirective } from '../../directives/localized-router-link.directive';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { I18nService } from '../../services/i18n.service';
import { OperatorService } from '../../services/operator.service';

@Component({
  selector: 'app-legal-page',
  imports: [CommonModule, RouterLink, LocalizedRouterLinkDirective, TranslatePipe],
  templateUrl: './legal-page.component.html',
  styleUrl: './legal-page.component.scss'
})
export class LegalPageComponent {
  private route = inject(ActivatedRoute);
  private i18n = inject(I18nService);
  private operator = inject(OperatorService);

  constructor() { this.operator.load(); }

  /** Body text with the provider's details filled in. */
  text(key: string): string { return this.operator.fill(this.i18n.t(key)); }
  titleKey = this.route.snapshot.data['titleKey'] as string;
  namespace = this.route.snapshot.data['namespace'] as string;
  isInfoPage = !!this.route.snapshot.data['info'];
  sections = Array.from({ length: this.route.snapshot.data['sectionCount'] as number }, (_, i) => i + 1);
}
