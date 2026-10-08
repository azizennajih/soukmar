import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { RESPONSE_INIT } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LocalizedRouterLinkDirective } from '../../directives/localized-router-link.directive';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { SeoService } from '../../services/seo.service';

/** "Page not found". Answers with a real HTTP 404 during server-side rendering (a redirect to the home page
 * would be a "soft 404" for search engines) and is kept out of the index. */
@Component({
  selector: 'app-not-found',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, LocalizedRouterLinkDirective, TranslatePipe],
  template: `
    <section class="container not-found">
      <p class="not-found__code">404</p>
      <h1>{{ 'not_found.title' | T }}</h1>
      <p class="not-found__text">{{ 'not_found.body' | T }}</p>
      <div class="not-found__actions">
        <a class="btn-primary" routerLink="/">{{ 'not_found.home' | T }}</a>
        <a class="btn-outline" routerLink="/annonces">{{ 'not_found.browse' | T }}</a>
      </div>
    </section>
  `,
  styles: [`
    .not-found { text-align: center; padding: 4rem 1.25rem; }
    .not-found__code { font-size: 4rem; font-weight: 800; color: var(--primary); margin: 0; line-height: 1; }
    h1 { font-size: 1.6rem; margin: .75rem 0 .5rem; }
    .not-found__text { color: var(--text-muted); max-width: 32rem; margin: 0 auto 1.5rem; }
    .not-found__actions { display: flex; gap: .75rem; justify-content: center; flex-wrap: wrap; }
  `]
})
export class NotFoundComponent {
  constructor() {
    const response = inject(RESPONSE_INIT, { optional: true });
    if (response) response.status = 404; // only exists during server-side rendering
    inject(SeoService).markNotFound();
  }
}
