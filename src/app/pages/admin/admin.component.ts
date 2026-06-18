import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ListingService } from '../../services/listing.service';
import { Listing, CATEGORIES } from '../../models/listing.model';

@Component({
  selector: 'app-admin',
  imports: [CommonModule, RouterLink],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export class AdminComponent implements OnInit {
  allListings: Listing[] = [];
  pending: Listing[] = [];

  stats = [
    { label: 'Utilisateurs',     value: '12,450', icon: '👥', trend: '+12%', color: '#3b82f6' },
    { label: 'Annonces totales', value: '50,231', icon: '📋', trend: '+8%',  color: '#22c55e' },
    { label: 'Annonces actives', value: '41,892', icon: '✅', trend: '+5%',  color: '#10b981' },
    { label: 'En attente',       value: '127',    icon: '⏳', trend: 'À modérer', color: '#f59e0b' },
  ];

  getCategory(val: string) { return CATEGORIES.find(c => c.value === val); }

  constructor(private ls: ListingService) {}

  ngOnInit() {
    this.allListings = this.ls.getAll();
    this.pending     = this.allListings.filter(l => l.status === 'PENDING');
    // use first 5 as mock pending
    if (!this.pending.length) this.pending = this.allListings.slice(0, 5);
  }
}
