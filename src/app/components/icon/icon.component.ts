import { Component, Input } from '@angular/core';

export type IconName = 'location' | 'private' | 'business';

@Component({
  selector: 'app-icon',
  templateUrl: './icon.component.html',
})
export class IconComponent {
  @Input() name!: IconName;
  @Input() size = 15;
}
