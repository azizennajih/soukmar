import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BrowserStorageService } from './browser-storage.service';
import { apiBase } from '../config/api.config';

export interface AiCategorySuggestion {
  category: string;
  subcategory_code: string | null;
  subcategory_id: string | null;
}

/** Answer of POST /api/ai/listing-draft — already validated against the catalog by the backend. */
export interface AiListingDraft {
  product_name: string;
  suggested_title: string;
  suggested_description: string;
  suggested_category: AiCategorySuggestion;
  alternative_categories: AiCategorySuggestion[];
  attributes: Record<string, string | boolean>;
  missing_attributes: string[];
  confidence: number;
  missing_information: string[];
  keywords: string[];
  brand: string | null;
  model: string | null;
  color: string | null;
  material: string | null;
  features: string[];
  cached: boolean;
  images_analysed: number;
}

export interface AiStatus { configured: boolean; available: boolean; maxImages: number; }

/** AI listing assistant (self-hosted vision model behind our own API — the browser never talks to an AI service). */
@Injectable({ providedIn: 'root' })
export class AiListingService {
  private http = inject(HttpClient);
  private storage = inject(BrowserStorageService);
  private base = apiBase();

  status(): Observable<AiStatus> {
    return this.http.get<AiStatus>(`${this.base}/ai/status`);
  }

  /** `force` asks for a fresh result even if the same photos were analysed before. */
  draft(files: File[], lang: string, force = false): Observable<AiListingDraft> {
    const token = this.storage.getItem('soukmar_token');
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
    const form = new FormData();
    files.forEach(f => form.append('images', f));
    form.append('lang', lang);
    if (force) form.append('force', '1');
    return this.http.post<AiListingDraft>(`${this.base}/ai/listing-draft`, form, { headers });
  }
}
