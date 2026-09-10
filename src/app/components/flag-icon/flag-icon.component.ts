import { Component, Input } from '@angular/core';

/** Renders a country flag from a locally bundled SVG (copied from the
 * `flag-icons` package into src/assets/flags/, one per ISO 3166-1 code used
 * in dial-codes.ts) instead of the Unicode flag emoji — several browsers/
 * fonts (notably Windows Chrome without the right font) render flag emoji
 * as plain two-letter text ("MA") rather than an actual flag.
 *
 * Copied into public/flags/ (this project serves static files from public/,
 * not src/assets/ — see angular.json) as plain files rather than referencing
 * flag-icons' own CSS/SVGs directly: that CSS registers both the 4x3 and 1x1
 * variant of every flag, and several countries (e.g. Kosovo, the UK's home
 * nations) share an SVG basename between the two folders with different
 * content — Angular's build then fails with "output files share the same
 * path but have different contents" when it flattens every referenced
 * url() into one assets folder. */
@Component({
  selector: 'app-flag-icon',
  templateUrl: './flag-icon.component.html',
  styleUrl: './flag-icon.component.scss'
})
export class FlagIconComponent {
  @Input() iso!: string;
  @Input() size = 18;

  get src(): string {
    return `flags/${(this.iso || '').toLowerCase()}.svg`;
  }
}
