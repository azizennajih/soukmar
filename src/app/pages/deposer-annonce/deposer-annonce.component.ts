import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ListingService } from '../../services/listing.service';
import { CATEGORIES, MOROCCO_CITIES, Category } from '../../models/listing.model';

@Component({
  selector: 'app-deposer-annonce',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './deposer-annonce.component.html',
  styleUrl: './deposer-annonce.component.scss'
})
export class DeposerAnnonceComponent {
  categories = CATEGORIES;
  cities = MOROCCO_CITIES;
  steps = ['Catégorie', 'Détails', 'Photos', 'Contact'];
  step = 0;
  loading = false;
  success = false;

  form = {
    category: '' as Category | '',
    title: '',
    description: '',
    price: '',
    currency: 'MAD',
    city: '',
    phone: '',
    whatsapp: '',
    images: [] as string[],
  };

  constructor(
    public auth: AuthService,
    private ls: ListingService,
    private router: Router
  ) {}

  selectCategory(val: Category) {
    this.form.category = val;
    this.step = 1;
  }

  get canNext(): boolean {
    if (this.step === 0) return !!this.form.category;
    if (this.step === 1) return !!(this.form.title && this.form.description && this.form.city);
    return true;
  }

  get summaryCategory() {
    return this.categories.find(c => c.value === this.form.category);
  }

  publish() {
    this.loading = true;
    setTimeout(() => {
      const listing = this.ls.create({
        title: this.form.title,
        description: this.form.description,
        price: this.form.price ? +this.form.price : undefined,
        currency: this.form.currency,
        category: this.form.category as Category,
        city: this.form.city,
        images: this.form.images,
        status: 'ACTIVE',
        isPremium: false,
        isFeatured: false,
        phone: this.form.phone,
        whatsapp: this.form.whatsapp,
        userId: this.auth.currentUser()?.id || 'guest',
        user: this.auth.currentUser() ? {
          id: this.auth.currentUser()!.id,
          name: this.auth.currentUser()!.name,
          email: this.auth.currentUser()!.email,
          createdAt: new Date(),
        } : undefined,
      });
      this.loading = false;
      this.success = true;
      setTimeout(() => this.router.navigate(['/annonces', listing.id]), 2000);
    }, 800);
  }
}
