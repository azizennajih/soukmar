import { Component, Input } from '@angular/core';

/** Small inline-SVG flag per ISO country code — used instead of the Unicode
 * flag emoji, which several browsers/fonts (notably Windows Chrome without
 * the right font) render as plain two-letter text ("MA") rather than an
 * actual flag. Simplified shapes (no coats of arms, scripts, etc.), but
 * kept recognizable at the small size this renders at. */
@Component({
  selector: 'app-flag-icon',
  templateUrl: './flag-icon.component.html',
  styleUrl: './flag-icon.component.scss'
})
export class FlagIconComponent {
  @Input() iso!: string;
  @Input() size = 18;
}
