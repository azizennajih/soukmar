import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { I18nService } from './i18n.service';

/** Page titles in the visitor's language. A route may name its title with `data.titleKey`
 * (an i18n key); every other page gets the localized default. Pages with dynamic content
 * (listing detail, search results, home) still set their own title afterwards via SeoService. */
@Injectable({ providedIn: 'root' })
export class LocalizedTitleStrategy extends TitleStrategy {
  private title = inject(Title);
  private meta = inject(Meta);
  private i18n = inject(I18nService);

  override updateTitle(snapshot: RouterStateSnapshot): void {
    let route = snapshot.root;
    while (route.firstChild) route = route.firstChild;
    const key = route.data?.['titleKey'] as string | undefined;
    const name = key ? this.i18n.t(key) : '';
    this.title.setTitle(name && name !== key ? name + ' — SouqMar24' : this.i18n.t('seo.default_title'));
    // Same for the description crawlers and link previews read (pages with their own text override it later).
    this.meta.updateTag({ name: 'description', content: this.i18n.t('seo.default_description') });
  }
}
