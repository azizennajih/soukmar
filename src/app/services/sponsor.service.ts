import { Injectable, Signal, inject } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Observable, catchError, of, shareReplay, switchMap } from 'rxjs';
import { ApiService } from './api.service';
import { CountryService } from './country.service';

export type SponsorPlacement = 'SIDE' | 'INLINE';

export interface SponsorBanner {
  id: string;
  imageUrl: string;
  linkUrl: string;
  altText: string;
  placement: SponsorPlacement;
}

/** Advertising/affiliate banners managed in the admin area, filtered by the visitor's country. */
@Injectable({ providedIn: 'root' })
export class SponsorService {
  private api = inject(ApiService);
  private countryService = inject(CountryService);
  private cache = new Map<string, Observable<SponsorBanner[]>>();

  private fetch(placement: SponsorPlacement, country: string): Observable<SponsorBanner[]> {
    const key = `${placement}:${country}`;
    let req = this.cache.get(key);
    if (!req) {
      req = this.api.get<SponsorBanner[]>('/banners', { placement, country }).pipe(catchError(() => of([])), shareReplay(1));
      this.cache.set(key, req);
    }
    return req;
  }

  /** Banners for a placement, re-fetched when the visitor switches country. Call from an injection context. */
  banners(placement: SponsorPlacement): Signal<SponsorBanner[]> {
    return toSignal(
      toObservable(this.countryService.country).pipe(switchMap(country => this.fetch(placement, country))),
      { initialValue: [] as SponsorBanner[] },
    );
  }

  /** Counts a click (an aggregate number only); failures never matter to the visitor. */
  click(id: string): void {
    this.api.post(`/banners/${encodeURIComponent(id)}/click`, {}).subscribe({ error: () => { /* ignore */ } });
  }
}
