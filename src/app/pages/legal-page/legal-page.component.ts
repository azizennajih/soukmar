import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-legal-page',
  imports: [CommonModule, RouterLink, TranslatePipe],
  templateUrl: './legal-page.component.html',
  styleUrl: './legal-page.component.scss'
})
export class LegalPageComponent {
  private route = inject(ActivatedRoute);
  titleKey = this.route.snapshot.data['titleKey'] as string;
  namespace = this.route.snapshot.data['namespace'] as string;
  sections = Array.from({ length: this.route.snapshot.data['sectionCount'] as number }, (_, i) => i + 1);
}
