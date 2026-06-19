import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ListingService } from '../../services/listing.service';
import { UploadService } from '../../services/upload.service';
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
  uploading = false;
  success = false;
  error = '';

  previews: string[] = [];
  selectedFiles: File[] = [];

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
    private uploadService: UploadService,
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

  onFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;
    const newFiles = Array.from(input.files).slice(0, 10 - this.selectedFiles.length);
    newFiles.forEach(file => {
      this.selectedFiles.push(file);
      const reader = new FileReader();
      reader.onload = e => this.previews.push(e.target?.result as string);
      reader.readAsDataURL(file);
    });
  }

  removeImage(index: number) {
    this.selectedFiles.splice(index, 1);
    this.previews.splice(index, 1);
    this.form.images.splice(index, 1);
  }

  async publish() {
    if (!this.auth.isLoggedIn) { this.router.navigate(['/auth/login']); return; }
    this.loading = true;
    this.error = '';

    try {
      // Upload images to Cloudinary first
      if (this.selectedFiles.length > 0) {
        this.uploading = true;
        const result = await new Promise<{ urls: string[] }>((resolve, reject) => {
          this.uploadService.uploadImages(this.selectedFiles).subscribe({ next: resolve, error: reject });
        });
        this.form.images = result.urls;
        this.uploading = false;
      }

      // Create listing with image URLs
      this.ls.create({
        title: this.form.title,
        description: this.form.description,
        price: this.form.price ? +this.form.price : undefined,
        currency: this.form.currency,
        category: this.form.category as Category,
        city: this.form.city,
        images: this.form.images,
        phone: this.form.phone,
        whatsapp: this.form.whatsapp,
      }).subscribe({
        next: listing => {
          this.loading = false;
          this.success = true;
          setTimeout(() => this.router.navigate(['/annonces', listing.id]), 2000);
        },
        error: () => {
          this.loading = false;
          this.error = 'Une erreur est survenue. Veuillez réessayer.';
        }
      });
    } catch {
      this.uploading = false;
      this.loading = false;
      this.error = 'Erreur lors du téléchargement des images.';
    }
  }
}
