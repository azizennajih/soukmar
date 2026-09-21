import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { I18nService } from '../../services/i18n.service';
import { isSupportedLang } from '../../services/locale-routing';

/**
 * Component for the locale-matched parent route (`app.routes.ts`'s
 * `localeUrlMatcher`) — its only job is making the URL's `:lang`-equivalent
 * segment the source of truth for I18nService, then getting out of the way
 * via a plain `<router-outlet>` for the real page underneath.
 *
 * Subscribing to `ActivatedRoute.paramMap` (rather than reading the
 * snapshot once in the constructor) is what makes this correct whether or
 * not Angular reuses this component instance across a `/fr/... -> /en/...`
 * language switch — paramMap emits on every navigation either way, so
 * I18nService stays in sync regardless of the router's reuse strategy.
 */
@Component({
  selector: 'app-locale-shell',
  imports: [RouterOutlet],
  template: `<router-outlet />`,
})
export class LocaleShellComponent {
  private route = inject(ActivatedRoute);
  private i18n = inject(I18nService);
  private destroyRef = inject(DestroyRef);

  constructor() {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      const lang = params.get('lang');
      if (isSupportedLang(lang)) this.i18n.setLang(lang);
    });
  }
}
