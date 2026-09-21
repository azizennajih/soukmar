import { inject, Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Meta, MetaDefinition, Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { DEFAULT_LANG, SUPPORTED_LANGS, stripLangPrefix } from './locale-routing';

export { stripLangPrefix };
export const SITE_URL = 'https://souqmar24.com';

@Injectable({ providedIn: 'root' })
export class SeoService {
  private document = inject(DOCUMENT);
  private meta = inject(Meta);
  private titleService = inject(Title);
  private router = inject(Router);

  /** Absolute URL for the page currently being rendered — correct during
   * SSR (derived from the request) and in the browser alike, unlike
   * window.location which only exists client-side. */
  get canonicalUrl(): string {
    return `${SITE_URL}${this.router.url}`;
  }

  /** Passthrough for one-off tags (og:image, twitter:*) that don't belong
   * in this service's own opinionated helpers above. */
  updateTag(tag: MetaDefinition) {
    this.meta.updateTag(tag);
  }

  setTitleAndDescription(title: string, description: string) {
    this.titleService.setTitle(title);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
  }

  /** Points crawlers at one canonical URL per page — critical on
   * `/annonces` where filter/sort query params otherwise create endless
   * near-duplicate URLs Google would rather not index separately. Pass an
   * explicit `url` to strip query params (self-referencing without them);
   * omit it to canonicalize to the current URL as-is. */
  setCanonical(url: string = this.canonicalUrl) {
    let link = this.document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.document.head.appendChild(link);
    }
    link.setAttribute('href', url);
    this.meta.updateTag({ property: 'og:url', content: url });
  }

  /**
   * Emits one `<link rel="alternate" hreflang="{code}">` per supported
   * language plus one `hreflang="x-default"` (pointing at DEFAULT_LANG's
   * URL) — the standard signal that tells Google these per-language URLs
   * are translations of the same page rather than separate content, and
   * that it should serve the right one per searcher.
   *
   * `path` is the page's path WITHOUT a language prefix (e.g. `/annonces/abc123`,
   * or `/` for the homepage) — pass `this.router.url` run through
   * `stripLangPrefix()` (re-exported here for call sites that need it) if
   * you don't already have the bare path on hand.
   */
  setHreflangAlternates(path: string) {
    this.removeHreflangAlternates();
    const bare = stripLangPrefix(path);
    const suffix = bare === '/' ? '' : bare;
    for (const lang of SUPPORTED_LANGS) {
      this.appendAlternateLink(lang, `${SITE_URL}/${lang}${suffix}`);
    }
    this.appendAlternateLink('x-default', `${SITE_URL}/${DEFAULT_LANG}${suffix}`);
  }

  removeHreflangAlternates() {
    this.document.querySelectorAll('link[data-hreflang]').forEach(el => el.remove());
  }

  private appendAlternateLink(hreflang: string, href: string) {
    const link = this.document.createElement('link');
    link.setAttribute('rel', 'alternate');
    link.setAttribute('hreflang', hreflang);
    link.setAttribute('href', href);
    link.setAttribute('data-hreflang', 'true');
    this.document.head.appendChild(link);
  }

  setStructuredData(id: string, data: unknown) {
    this.removeStructuredData(id);
    const script = this.document.createElement('script');
    script.id = id;
    script.type = 'application/ld+json';
    script.text = JSON.stringify(data);
    this.document.head.appendChild(script);
  }

  removeStructuredData(id: string) {
    this.document.getElementById(id)?.remove();
  }
}
