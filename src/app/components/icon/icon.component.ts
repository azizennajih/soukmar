import { Component, Input } from '@angular/core';

export type IconName =
  | 'location' | 'private' | 'business' | 'report' | 'offer'
  | 'eye' | 'clock' | 'lock' | 'unlock' | 'star' | 'phone' | 'message'
  | 'check' | 'close' | 'block' | 'trash' | 'edit' | 'bell'
  | 'trending-up' | 'trending-down' | 'image' | 'shield' | 'link'
  | 'list' | 'map' | 'zap' | 'users' | 'bar-chart' | 'id-card'
  | 'camera' | 'phone-call' | 'mic' | 'mic-off' | 'phone-off';

@Component({
  selector: 'app-icon',
  templateUrl: './icon.component.html',
})
export class IconComponent {
  @Input() name!: IconName;
  @Input() size = 15;
}
