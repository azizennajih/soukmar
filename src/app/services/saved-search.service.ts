import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { SavedSearch } from '../models/listing.model';

@Injectable({ providedIn: 'root' })
export class SavedSearchService {
  constructor(private api: ApiService) {}

  getAll(): Observable<SavedSearch[]> {
    return this.api.get<SavedSearch[]>('/saved-searches');
  }

  create(data: Partial<SavedSearch>): Observable<SavedSearch> {
    return this.api.post<SavedSearch>('/saved-searches', data);
  }

  delete(id: string): Observable<{ success: boolean }> {
    return this.api.delete<{ success: boolean }>(`/saved-searches/${id}`);
  }
}
