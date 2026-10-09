import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface Coords { lat: number; lng: number }

@Injectable({ providedIn: 'root' })
export class GeocodeService {
  constructor(private api: ApiService) {}

  /** `country` (ISO code) looks the place up in that country; without it the server assumes Morocco. */
  geocode(query: string, country?: string): Observable<Coords> {
    return this.api.get<Coords>('/geocode', country ? { q: query, country } : { q: query });
  }

  /** Rejects if the browser denies permission or geolocation is unavailable. */
  getCurrentPosition(): Promise<Coords> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) { reject(new Error('unsupported')); return; }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => reject(err),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  }
}
