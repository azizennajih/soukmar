import { Component, ChangeDetectionStrategy, computed, inject } from '@angular/core';
import { SponsorService } from '../../services/sponsor.service';
import { SponsorBannerComponent } from '../sponsor-banner/sponsor-banner.component';
import { TranslatePipe } from '../../pipes/translate.pipe';

/** Slim advertising banners left and right of the page content. Only shown on wide screens (see the scss): on
 * laptops and phones there is no room next to the 1280px container. The first banner goes left, the second right;
 * with a single banner it appears on both sides. */
@Component({
  selector: 'app-sponsor-rails',
  imports: [SponsorBannerComponent, TranslatePipe],
  templateUrl: './sponsor-rails.component.html',
  styleUrl: './sponsor-rails.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SponsorRailsComponent {
  private banners = inject(SponsorService).banners('SIDE');
  left = computed(() => this.banners()[0] ?? null);
  right = computed(() => this.banners()[1] ?? this.banners()[0] ?? null);
}
