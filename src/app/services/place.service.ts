import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface PlaceHit { name: string; admin1: string | null; population: number }

/** City/village suggestions for one country (GeoNames data, served by the backend). */
@Injectable({ providedIn: 'root' })
export class PlaceService {
  constructor(private api: ApiService) {}

  search(country: string, q: string, limit = 20): Observable<PlaceHit[]> {
    return this.api.get<PlaceHit[]>('/places', { country, q, limit: String(limit) });
  }
}
