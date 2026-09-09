import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../pipes/translate.pipe';

/** Surfaces the trust signal that already exists on every account
 * (emailVerified blocks login; phoneVerified comes from the SMS-code flow)
 * wherever a seller or buyer is shown to someone else — it was previously
 * only enforced, never displayed. Renders nothing if neither is verified,
 * so an unverified account just shows no badge rather than a "not verified"
 * warning next to every name. */
@Component({
  selector: 'app-verified-badge',
  imports: [CommonModule, TranslatePipe],
  templateUrl: './verified-badge.component.html',
  styleUrl: './verified-badge.component.scss'
})
export class VerifiedBadgeComponent {
  @Input() emailVerified: boolean | null | undefined = false;
  @Input() phoneVerified: boolean | null | undefined = false;
  @Input() size: 'sm' | 'md' = 'md';
}
