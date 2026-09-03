import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Review } from '../models/listing.model';

export interface ReviewsResponse {
  reviews: Review[];
  avgRating: number | null;
  count: number;
}

export interface CanReviewResponse {
  canReview: boolean;
  revieweeId?: string;
  alreadyReviewed?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ReviewService {
  constructor(private api: ApiService) {}

  getForUser(userId: string): Observable<ReviewsResponse> {
    return this.api.get<ReviewsResponse>(`/reviews/user/${userId}`);
  }

  canReview(listingId: string): Observable<CanReviewResponse> {
    return this.api.get<CanReviewResponse>(`/reviews/can-review/${listingId}`);
  }

  submit(data: { listingId: string; revieweeId: string; rating: number; comment?: string }): Observable<Review> {
    return this.api.post<Review>('/reviews', data);
  }
}
