import { Component, ChangeDetectionStrategy, inject, input } from '@angular/core';
import { SponsorBanner, SponsorService } from '../../services/sponsor.service';
import { ImageUrlPipe } from '../../pipes/image-url.pipe';
import { TranslatePipe } from '../../pipes/translate.pipe';

/** One advertising banner with the mandatory "Werbung" label. The link is marked `sponsored` (affiliate links). */
@Component({
  selector: 'app-sponsor-banner',
  imports: [ImageUrlPipe, TranslatePipe],
  templateUrl: './sponsor-banner.component.html',
  styleUrl: './sponsor-banner.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SponsorBannerComponent {
  private sponsors = inject(SponsorService);
  banner = input.required<SponsorBanner>();
  /** Widest size the image is displayed at (px), so Cloudinary delivers no more than needed. */
  width = input(1200);

  onClick() { this.sponsors.click(this.banner().id); }
}
