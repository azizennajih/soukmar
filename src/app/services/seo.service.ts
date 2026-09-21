import { inject, Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Meta, MetaDefinition, Title } from '@angular/platform-browser';
import { Router } from '@angular/router';

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
