import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../pipes/translate.pipe';

/** Small reusable star display for anywhere a seller or buyer is shown —
 * annonce detail's seller box, chat — so trust info (rating) is visible
 * everywhere, not just on the full seller-profile page. */
@Component({
  selector: 'app-star-rating',
  imports: [CommonModule, TranslatePipe],
  templateUrl: './star-rating.component.html',
  styleUrl: './star-rating.component.scss'
})
export class StarRatingComponent {
  @Input() avgRating: number | null | undefined = null;
  @Input() reviewCount = 0;
  /** 'sm' for tight spots like a chat header/list row. */
  @Input() size: 'sm' | 'md' = 'md';

  stars = [1, 2, 3, 4, 5];

  get roundedRating(): number {
    return this.avgRating ? Math.round(this.avgRating) : 0;
  }

  get hasReviews(): boolean {
    return !!this.avgRating && this.reviewCount > 0;
  }
}
