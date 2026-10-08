import { Injectable, Injector, inject } from '@angular/core';

import { RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { I18nService } from './i18n.service';
import { SeoMode, decideSeo } from './seo-rules';
import { SeoService } from './seo.service';

/** Page titles in the visitor's language. A route may name its title with `data.titleKey`
 * (an i18n key); every other page gets the localized default. Pages with dynamic content
 * (listing detail, search results, home) still set their own title afterwards via SeoService. */
@Injectable({ providedIn: 'root' })
export class LocalizedTitleStrategy extends TitleStrategy {
  private i18n = inject(I18nService);
  // SeoService needs the Router, which itself needs this strategy — resolve it lazily to avoid a cycle.
  private injector = inject(Injector);

  override updateTitle(snapshot: RouterStateSnapshot): void {
    let route = snapshot.root;
    while (route.firstChild) route = route.firstChild;
    const key = route.data?.['titleKey'] as string | undefined;
    const name = key ? this.i18n.t(key) : '';
    const seo = this.injector.get(SeoService);
    // Title and description (plus the og:/twitter: copies link previews read) in the visitor's language;
    // pages with their own text override them later.
    seo.setTitleAndDescription(name && name !== key ? 'SouqMar24 — ' + name : this.i18n.t('seo.default_title'), this.i18n.t('seo.default_description'));

    // Canonical URL, robots and hreflang for every page: one rule set (seo-rules.ts) instead of each page remembering to.
    const mode = (route.data?.['seo'] as SeoMode | undefined) ?? 'index';
    seo.applyDecision(decideSeo(snapshot.url, mode), this.i18n.lang());
  }
}
