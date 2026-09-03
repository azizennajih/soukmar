import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Listing, ListingAttributesPayload } from '../models/listing.model';

export interface ListingsResponse {
  listings: Listing[];
  total: number;
  page: number;
  pages: number;
}

export interface ListingFilters {
  q?: string;
  category?: string;
  subcategoryId?: string;
  condition?: string;
  city?: string;
  minPrice?: string;
  maxPrice?: string;
  lat?: string;
  lng?: string;
  radius?: string;
  tri?: string;
  page?: string;
  limit?: string;
  attrs?: Record<string, string>;
}

@Injectable({ providedIn: 'root' })
export class ListingService {
  constructor(private api: ApiService) {}

  getAll(filters?: ListingFilters): Observable<ListingsResponse> {
    const { attrs, ...rest } = filters ?? {};
    return this.api.get<ListingsResponse>('/listings', { ...rest, ...attrs } as Record<string, string>);
  }

  getById(id: string): Observable<Listing> {
    return this.api.get<Listing>(`/listings/${id}`);
  }

  getMyListings(): Observable<Listing[]> {
    return this.api.get<Listing[]>('/listings/user/mine');
  }

  create(data: Partial<Listing> & ListingAttributesPayload): Observable<Listing> {
    return this.api.post<Listing>('/listings', data);
  }

  update(id: string, data: Partial<Listing> & ListingAttributesPayload): Observable<Listing> {
    return this.api.put<Listing>(`/listings/${id}`, data);
  }

  delete(id: string): Observable<{ success: boolean }> {
    return this.api.delete<{ success: boolean }>(`/listings/${id}`);
  }

  bump(id: string): Observable<Listing> {
    return this.api.post<Listing>(`/listings/${id}/bump`, {});
  }

  getViewStats(id: string): Observable<{ days: { date: string; count: number }[]; total: number }> {
    return this.api.get(`/listings/${id}/view-stats`);
  }
}
