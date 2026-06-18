import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ListingService } from '../../services/listing.service';
import { ListingCardComponent } from '../../components/listing-card/listing-card.component';
import { CATEGORIES, MOROCCO_CITIES, Listing } from '../../models/listing.model';

@Component({
  selector: 'app-annonces',
  imports: [CommonModule, RouterLink, FormsModule, ListingCardComponent],
  templateUrl: './annonces.component.html',
  styleUrl: './annonces.component.scss'
})
export class AnnoncesComponent implements OnInit {
  categories = CATEGORIES;
  cities = MOROCCO_CITIES;
  listings: Listing[] = [];

  filters = { q: '', categorie: '', ville: '', minPrix: '', maxPrix: '', tri: '' };

  constructor(
    private listingService: ListingService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.filters.q         = params['q']         || '';
      this.filters.categorie = params['categorie'] || '';
      this.filters.ville     = params['ville']     || '';
      this.filters.minPrix   = params['minPrix']   || '';
      this.filters.maxPrix   = params['maxPrix']   || '';
      this.filters.tri       = params['tri']       || '';
      this.loadListings();
    });
  }

  loadListings() {
    this.listings = this.listingService.getAll({
      q:        this.filters.q        || undefined,
      category: this.filters.categorie || undefined,
      city:     this.filters.ville    || undefined,
      minPrice: this.filters.minPrix  ? +this.filters.minPrix : undefined,
      maxPrice: this.filters.maxPrix  ? +this.filters.maxPrix : undefined,
    });
    if (this.filters.tri === 'prix_asc')
      this.listings.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
    else if (this.filters.tri === 'prix_desc')
      this.listings.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
  }

  applyFilters() {
    const qp: any = {};
    if (this.filters.q)        qp['q']         = this.filters.q;
    if (this.filters.categorie) qp['categorie'] = this.filters.categorie;
    if (this.filters.ville)    qp['ville']     = this.filters.ville;
    if (this.filters.minPrix)  qp['minPrix']   = this.filters.minPrix;
    if (this.filters.maxPrix)  qp['maxPrix']   = this.filters.maxPrix;
    if (this.filters.tri)      qp['tri']       = this.filters.tri;
    this.router.navigate([], { queryParams: qp });
  }

  resetFilters() {
    this.filters = { q: '', categorie: '', ville: '', minPrix: '', maxPrix: '', tri: '' };
    this.router.navigate([], { queryParams: {} });
  }

  get activeCategory() {
    return this.categories.find(c => c.value === this.filters.categorie);
  }
}
