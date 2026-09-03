import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface Coords { lat: number; lng: number }

@Injectable({ providedIn: 'root' })
export class GeocodeService {
  constructor(private api: ApiService) {}

  geocode(query: string): Observable<Coords> {
    return this.api.get<Coords>('/geocode', { q: query });
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
