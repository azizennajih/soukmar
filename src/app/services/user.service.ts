import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Listing, SellerProfile } from '../models/listing.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private api: ApiService) {}

  getProfile(id: string): Observable<SellerProfile> {
    return this.api.get<SellerProfile>(`/users/${id}/profile`);
  }

  getListings(id: string): Observable<Listing[]> {
    return this.api.get<Listing[]>(`/users/${id}/listings`);
  }
}
