import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { AttributeDefinition, Category, Subcategory } from '../models/listing.model';

export interface CategoryFullResponse {
  subcategories: (Subcategory & { attributeDefinitions: AttributeDefinition[] })[];
}

@Injectable({ providedIn: 'root' })
export class CatalogService {
  constructor(private api: ApiService) {}

  getSubcategories(category?: Category): Observable<Subcategory[]> {
    return this.api.get<Subcategory[]>('/catalog/subcategories', category ? { category } : undefined);
  }

  getAttributes(subcategoryId: string): Observable<AttributeDefinition[]> {
    return this.api.get<AttributeDefinition[]>(`/catalog/subcategories/${subcategoryId}/attributes`);
  }

  getCategoryFull(category: Category): Observable<CategoryFullResponse> {
    return this.api.get<CategoryFullResponse>(`/catalog/categories/${category}/full`);
  }
}
