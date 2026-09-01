import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Listing } from '../models/listing.model';

export interface ListingsResponse {
  listings: Listing[];
  total: number;
  page: number;
  pages: number;
}

export interface ListingFilters {
  q?: string;
  category?: string;
  city?: string;
  minPrice?: string;
  maxPrice?: string;
  page?: string;
  limit?: string;
}

@Injectable({ providedIn: 'root' })
export class ListingService {
  constructor(private api: ApiService) {}

  getAll(filters?: ListingFilters): Observable<ListingsResponse> {
    return this.api.get<ListingsResponse>('/listings', filters as Record<string, string>);
  }

  getById(id: string): Observable<Listing> {
    return this.api.get<Listing>(`/listings/${id}`);
  }

  getMyListings(): Observable<Listing[]> {
    return this.api.get<Listing[]>('/listings/user/mine');
  }

  create(data: Partial<Listing>): Observable<Listing> {
    return this.api.post<Listing>('/listings', data);
  }

  update(id: string, data: Partial<Listing>): Observable<Listing> {
    return this.api.put<Listing>(`/listings/${id}`, data);
  }

  delete(id: string): Observable<{ success: boolean }> {
    return this.api.delete<{ success: boolean }>(`/listings/${id}`);
  }
}
