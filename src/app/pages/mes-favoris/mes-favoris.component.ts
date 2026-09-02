import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';
import { I18nService } from '../../services/i18n.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { Listing } from '../../models/listing.model';
import { ListingCardComponent } from '../../components/listing-card/listing-card.component';

@Component({
  selector: 'app-mes-favoris',
  imports: [CommonModule, RouterLink, TranslatePipe, ListingCardComponent],
  templateUrl: './mes-favoris.component.html',
  styleUrl: './mes-favoris.component.scss'
})
export class MesFavorisComponent implements OnInit {
  i18n = inject(I18nService);
  listings: Listing[] = [];
  loading = false;

  constructor(public auth: AuthService, private api: ApiService, private router: Router, private cdr: ChangeDetectorRef) {}

  async ngOnInit() {
    if (!this.auth.isLoggedIn) { this.router.navigate(['/auth/login']); return; }
    this.loading = true;
    try {
      this.listings = await firstValueFrom(this.api.get<Listing[]>('/favorites'));
    } finally {
      this.loading = false;
      this.cdr.markForCheck();
    }
  }
}
