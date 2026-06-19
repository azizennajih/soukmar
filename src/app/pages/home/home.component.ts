import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ListingService } from '../../services/listing.service';
import { ListingCardComponent } from '../../components/listing-card/listing-card.component';
import { CATEGORIES, MOROCCO_CITIES, Listing } from '../../models/listing.model';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterLink, FormsModule, ListingCardComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  categories = CATEGORIES;
  cities = MOROCCO_CITIES.slice(0, 12);
  featured: Listing[] = [];
  latest: Listing[] = [];
  searchQuery = '';
  selectedCity = '';

  stats = [
    { label: 'Annonces actives', value: '50K+' },
    { label: 'Utilisateurs inscrits', value: '120K+' },
    { label: 'Villes couvertes', value: '50+' },
    { label: 'Annonces / mois', value: '5K+' },
  ];

  features = [
    { icon: '⚡', title: 'Rapide & Simple', desc: 'Publiez votre annonce en moins de 2 minutes', bg: '#fef9c3', color: '#a16207' },
    { icon: '🛡️', title: '100% Sécurisé', desc: 'Toutes les annonces sont vérifiées par notre équipe', bg: '#dcfce7', color: '#15803d' },
    { icon: '👥', title: 'Grande communauté', desc: 'Plus de 120,000 acheteurs et vendeurs actifs', bg: '#dbeafe', color: '#1d4ed8' },
    { icon: '📈', title: 'Boostez vos ventes', desc: 'Options premium pour maximiser la visibilité', bg: '#f3e8ff', color: '#7e22ce' },
  ];

  constructor(private listingService: ListingService, private router: Router) {}

  ngOnInit() {
    this.listingService.getAll({ limit: '20' }).subscribe(res => {
      this.featured = res.listings.filter(l => l.isFeatured);
      this.latest = res.listings.slice(0, 8);
    });
  }

  search() {
    const params: Record<string, string> = {};
    if (this.searchQuery.trim()) params['q'] = this.searchQuery;
    if (this.selectedCity) params['ville'] = this.selectedCity;
    this.router.navigate(['/annonces'], { queryParams: params });
  }

  goToCity(city: string) {
    this.router.navigate(['/annonces'], { queryParams: { ville: city } });
  }
}
