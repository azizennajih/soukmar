import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-aide',
  imports: [CommonModule, RouterLink, TranslatePipe],
  templateUrl: './aide.component.html',
  styleUrl: './aide.component.scss'
})
export class AideComponent {}
