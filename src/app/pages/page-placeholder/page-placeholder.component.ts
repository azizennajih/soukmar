import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-page-placeholder',
  imports: [CommonModule, RouterLink, TranslatePipe],
  templateUrl: './page-placeholder.component.html',
  styleUrl: './page-placeholder.component.scss'
})
export class PagePlaceholderComponent {
  private route = inject(ActivatedRoute);
  titleKey = this.route.snapshot.data['titleKey'] as string;
}
