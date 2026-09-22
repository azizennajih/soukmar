import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Listing, ListingAttributesPayload, Category } from '../models/listing.model';
import { BoostRequest, BoostStatus, BoostTierId } from '../models/boost.model';

export interface ListingsResponse {
  listings: Listing[];
  total: number;
  page: number;
  pages: number;
}

export interface SearchSuggestions {
  categories: { category: Category; count: number }[];
  phrases: string[];
}

export interface ListingFilters {
  q?: string;
  category?: string;
  subcategoryId?: string;
  condition?: string;
  accountType?: string;
  intent?: string;
  country?: string;
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

  getSuggestions(q: string, country?: string): Observable<SearchSuggestions> {
    return this.api.get<SearchSuggestions>('/listings/suggestions', country ? { q, country } : { q });
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

  extend(id: string): Observable<Listing> {
    return this.api.post<Listing>(`/listings/${id}/extend`, {});
  }

  getBoostStatus(id: string): Observable<BoostStatus> {
    return this.api.get<BoostStatus>(`/listings/${id}/boost-status`);
  }

  requestBoost(id: string, tiers: BoostTierId[]): Observable<BoostRequest> {
    return this.api.post<BoostRequest>(`/listings/${id}/boost-request`, { tiers });
  }

  getViewStats(id: string): Observable<{ days: { date: string; count: number }[]; total: number }> {
    return this.api.get(`/listings/${id}/view-stats`);
  }

  getFunnel(id: string): Observable<{ views: number; favorites: number; contacts: number; offers: number; offersAccepted: number }> {
    return this.api.get(`/listings/${id}/funnel`);
  }

  /** Free "search by photo": uploads a query image and returns visually
   * similar active/reserved listings, closest match first (server-side
   * perceptual-hash comparison, no paid vision API — see
   * soukmar-backend's lib/imageHash.ts). */
  searchByImage(file: File): Observable<Listing[]> {
    const form = new FormData();
    form.append('image', file);
    return this.api.post(`/listings/search-by-image`, form);
  }

  getSimilar(id: string): Observable<Listing[]> {
    return this.api.get<Listing[]>(`/listings/${id}/similar`);
  }

  getInterests(): Observable<{ category: Category; newListingsCount: number }[]> {
    return this.api.get(`/listings/interests`);
  }
}
