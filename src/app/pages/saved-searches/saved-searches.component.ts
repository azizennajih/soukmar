import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SavedSearchService } from '../../services/saved-search.service';
import { AuthService } from '../../services/auth.service';
import { SavedSearch, CATEGORIES } from '../../models/listing.model';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { CityLabelPipe } from '../../pipes/city-label.pipe';

@Component({
  selector: 'app-saved-searches',
  imports: [CommonModule, TranslatePipe, CityLabelPipe],
  templateUrl: './saved-searches.component.html',
  styleUrl: './saved-searches.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SavedSearchesComponent implements OnInit {
  private savedSearchService = inject(SavedSearchService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  public auth = inject(AuthService);
  categories = CATEGORIES;

  searches: SavedSearch[] = [];
  loading = true;

  ngOnInit() {
    if (!this.auth.isLoggedIn) { this.router.navigate(['/auth/login']); return; }
    this.savedSearchService.getAll().subscribe({
      next: s => { this.searches = s; this.loading = false; this.cdr.markForCheck(); },
      error: () => { this.loading = false; this.cdr.markForCheck(); }
    });
  }

  category(s: SavedSearch) {
    return this.categories.find(c => c.value === s.category);
  }

  private filterParams(s: SavedSearch): Record<string, string> {
    const qp: Record<string, string> = {};
    if (s.category) qp['categorie'] = s.category;
    if (s.subcategoryId) qp['souscategorie'] = s.subcategoryId;
    if (s.q) qp['q'] = s.q;
    if (s.city) qp['ville'] = s.city;
    if (s.minPrice != null) qp['minPrix'] = String(s.minPrice);
    if (s.maxPrice != null) qp['maxPrix'] = String(s.maxPrice);
    if (s.condition) qp['condition'] = s.condition;
    if (s.attrs) for (const [code, vals] of Object.entries(s.attrs)) qp[`attr_${code}`] = vals.join(',');
    return qp;
  }

  open(s: SavedSearch) {
    this.router.navigate(['/annonces'], { queryParams: this.filterParams(s) });
  }

  edit(s: SavedSearch, e: Event) {
    e.stopPropagation();
    this.router.navigate(['/annonces'], {
      queryParams: { ...this.filterParams(s), editSearch: s.id, editSearchName: s.name }
    });
  }

  remove(s: SavedSearch, e: Event) {
    e.stopPropagation();
    this.searches = this.searches.filter(x => x.id !== s.id);
    this.cdr.markForCheck();
    this.savedSearchService.delete(s.id).subscribe({ error: () => {} });
  }
}
