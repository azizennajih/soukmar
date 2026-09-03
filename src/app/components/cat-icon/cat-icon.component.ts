import { Component, Input } from '@angular/core';
import { Category } from '../../models/listing.model';

@Component({
  selector: 'app-cat-icon',
  templateUrl: './cat-icon.component.html',
})
export class CatIconComponent {
  @Input() category!: Category;
  @Input() size = 22;
}
