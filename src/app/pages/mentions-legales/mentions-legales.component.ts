import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-mentions-legales',
  imports: [CommonModule, RouterLink, TranslatePipe],
  templateUrl: './mentions-legales.component.html',
  styleUrl: './mentions-legales.component.scss'
})
export class MentionsLegalesComponent {
  noticeSections = Array.from({ length: 6 }, (_, i) => i + 1);
}
