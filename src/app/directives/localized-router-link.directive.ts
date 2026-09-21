import { Directive, effect, inject, Input, OnChanges } from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18nService } from '../services/i18n.service';
import { withLang } from '../services/locale-routing';

/**
 * Rewrites every `routerLink` in the app to stay inside the visitor's
 * current language's URL tree, without having to hand-edit the ~90
 * `routerLink="/annonces"` / `[routerLink]="['/annonces', id]"` call
 * sites across the codebase.
 *
 * It matches the same `[routerLink]` selector as Angular's own
 * `RouterLink` directive, so both directives sit on the same host
 * element and each receive the same raw input. We grab the co-located
 * `RouterLink` instance via DI and overwrite its `routerLink` property
 * with the localized commands — `RouterLink.routerLink` is a real setter
 * backed by a signal (see `@angular/router`'s `RouterLink.routerLinkInput`),
 * so re-assigning it after the fact still reactively updates the
 * rendered `href` and the URL used on click.
 *
 * Only absolute commands (first element a string starting with `/`) are
 * touched — see `withLang()` — so relative links and the `[]`-only
 * "update query params on the current page" pattern are left alone.
 *
 * Add `LocalizedRouterLinkDirective` next to `RouterLink` in any
 * component's `imports: [...]` that uses `routerLink` in its template.
 */
@Directive({
  selector: '[routerLink]',
  standalone: true,
})
export class LocalizedRouterLinkDirective implements OnChanges {
  @Input() routerLink: string | readonly unknown[] | null | undefined;

  private i18n = inject(I18nService);
  private hostLink = inject(RouterLink, { self: true });

  constructor() {
    // Keeps already-rendered links (footer, navbar, long static pages)
    // correct if the visitor switches language without that link's own
    // `routerLink` input ever changing.
    effect(() => {
      this.i18n.lang();
      this.applyLocalizedLink();
    });
  }

  ngOnChanges(): void {
    this.applyLocalizedLink();
  }

  private applyLocalizedLink(): void {
    const raw = this.routerLink;
    if (raw == null) {
      this.hostLink.routerLink = raw;
      return;
    }
    const commands = Array.isArray(raw) ? raw : [raw];
    this.hostLink.routerLink = withLang(commands, this.i18n.lang()) as unknown[];
  }
}
