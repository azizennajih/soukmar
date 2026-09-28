import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Listing, SellerProfile, FollowedUser } from '../models/listing.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private api: ApiService) {}

  getProfile(id: string): Observable<SellerProfile> {
    return this.api.get<SellerProfile>(`/users/${id}/profile`);
  }

  getListings(id: string): Observable<Listing[]> {
    return this.api.get<Listing[]>(`/users/${id}/listings`);
  }

  blockUser(id: string): Observable<{ blocked: boolean }> {
    return this.api.post<{ blocked: boolean }>(`/users/${id}/block`, {});
  }

  unblockUser(id: string): Observable<{ blocked: boolean }> {
    return this.api.delete<{ blocked: boolean }>(`/users/${id}/block`);
  }

  followUser(id: string): Observable<{ following: boolean; followerCount: number }> {
    return this.api.post<{ following: boolean; followerCount: number }>(`/users/${id}/follow`, {});
  }

  unfollowUser(id: string): Observable<{ following: boolean; followerCount: number }> {
    return this.api.delete<{ following: boolean; followerCount: number }>(`/users/${id}/follow`);
  }

  getFollowing(): Observable<FollowedUser[]> {
    return this.api.get<FollowedUser[]>('/users/me/following');
  }
}
