import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ListingService } from '../../services/listing.service';
import { UploadService } from '../../services/upload.service';
import { CatalogService } from '../../services/catalog.service';
import { I18nService } from '../../services/i18n.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { CatIconComponent } from '../../components/cat-icon/cat-icon.component';
import { CATEGORIES, MOROCCO_CITIES, CONDITION_CATEGORIES, Category, Subcategory, AttributeDefinition, Condition } from '../../models/listing.model';

@Component({
  selector: 'app-deposer-annonce',
  imports: [CommonModule, RouterLink, FormsModule, CatIconComponent, TranslatePipe],
  templateUrl: './deposer-annonce.component.html',
  styleUrl: './deposer-annonce.component.scss'
})
export class DeposerAnnonceComponent {
  i18n = inject(I18nService);
  categories = CATEGORIES;
  cities = MOROCCO_CITIES;

  get steps(): string[] {
    const t = (k: string) => this.i18n.t(k);
    return [t('deposer.step_category'), t('deposer.step_subcategory'), t('deposer.step_details'), t('deposer.step_photos'), t('deposer.step_contact')];
  }
  step = 0;
  loading = false;
  uploading = false;
  loadingSubcats = false;
  loadingAttrs = false;
  success = false;
  error = '';

  editId: string | null = null;
  initLoading = false;

  subcategories: Subcategory[] = [];
  attributeDefs: AttributeDefinition[] = [];

  previews: string[] = [];
  selectedFiles: File[] = [];
  existingImages: string[] = [];

  form = {
    category: '' as Category | '',
    subcategoryId: '',
    condition: '' as Condition | '',
    title: '',
    description: '',
    price: '',
    currency: 'MAD',
    city: '',
    phone: '',
    whatsapp: '',
    images: [] as string[],
    attributes: {} as Record<string, string | number | boolean>,
  };

  constructor(
    public auth: AuthService,
    private ls: ListingService,
    private uploadService: UploadService,
    private catalog: CatalogService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.editId = id;
      this.loadForEdit(id);
    }
  }

  get isEdit(): boolean { return !!this.editId; }

  loadForEdit(id: string) {
    this.initLoading = true;
    this.ls.getById(id).subscribe({
      next: listing => {
        const me = this.auth.currentUser();
        if (listing.userId !== me?.id && me?.role !== 'ADMIN') {
          this.router.navigate(['/mes-annonces']);
          return;
        }
        this.form.category = listing.category as Category;
        this.form.subcategoryId = listing.subcategoryId || '';
        this.form.condition = (listing.condition as Condition) || '';
        this.form.title = listing.title;
        this.form.description = listing.description;
        this.form.price = listing.price != null ? String(listing.price) : '';
        this.form.currency = listing.currency || 'MAD';
        this.form.city = listing.city;
        this.form.phone = listing.phone || '';
        this.form.whatsapp = listing.whatsapp || '';
        this.existingImages = [...(listing.images || [])];

        const attrs: Record<string, string | number | boolean> = {};
        (listing.attributeValues || []).forEach(av => {
          const code = av.attributeDefinition?.code;
          if (!code) return;
          if (av.valueText != null) attrs[code] = av.valueText;
          else if (av.valueNumber != null) attrs[code] = av.valueNumber;
          else if (av.valueBoolean != null) attrs[code] = av.valueBoolean;
        });
        this.form.attributes = attrs;

        if (this.form.category) {
          this.loadingSubcats = true;
          this.catalog.getSubcategories(this.form.category as Category).subscribe({
            next: subs => { this.subcategories = subs; this.loadingSubcats = false; this.cdr.markForCheck(); },
            error: () => { this.loadingSubcats = false; this.cdr.markForCheck(); }
          });
        }
        if (this.form.subcategoryId) {
          this.loadingAttrs = true;
          this.catalog.getAttributes(this.form.subcategoryId).subscribe({
            next: defs => { this.attributeDefs = defs; this.loadingAttrs = false; this.cdr.markForCheck(); },
            error: () => { this.loadingAttrs = false; this.cdr.markForCheck(); }
          });
        }

        this.step = 2;
        this.initLoading = false;
        this.cdr.markForCheck();
      },
      error: () => { this.initLoading = false; this.router.navigate(['/mes-annonces']); }
    });
  }

  get showCondition(): boolean {
    return !!this.form.category && CONDITION_CATEGORIES.includes(this.form.category as Category);
  }

  selectCategory(val: Category) {
    this.form.category = val;
    this.form.subcategoryId = '';
    this.attributeDefs = [];
    this.form.attributes = {};
    this.loadingSubcats = true;
    this.catalog.getSubcategories(val).subscribe({
      next: subs => {
        this.subcategories = subs;
        this.loadingSubcats = false;
        this.step = subs.length ? 1 : 2;
        this.cdr.markForCheck();
      },
      error: () => { this.subcategories = []; this.loadingSubcats = false; this.step = 2; this.cdr.markForCheck(); }
    });
  }

  selectSubcategory(sub: Subcategory) {
    this.form.subcategoryId = sub.id;
    this.form.attributes = {};
    this.loadingAttrs = true;
    this.catalog.getAttributes(sub.id).subscribe({
      next: defs => { this.attributeDefs = defs; this.loadingAttrs = false; this.step = 2; this.cdr.markForCheck(); },
      error: () => { this.attributeDefs = []; this.loadingAttrs = false; this.step = 2; this.cdr.markForCheck(); }
    });
  }

  setAttr(code: string, value: string | number | boolean) {
    this.form.attributes = { ...this.form.attributes, [code]: value };
  }

  attrBoolStr(code: string): string {
    const v = this.form.attributes[code];
    return v === undefined || v === null || v === '' ? '' : String(v);
  }

  goBack() {
    if (this.step === 2 && !this.subcategories.length) { this.step = 0; return; }
    this.step = this.step - 1;
  }

  get canNext(): boolean {
    if (this.step === 0) return !!this.form.category;
    if (this.step === 1) return !!this.form.subcategoryId;
    if (this.step === 2) {
      if (!(this.form.title && this.form.description && this.form.city)) return false;
      return this.attributeDefs
        .filter(d => d.required)
        .every(d => {
          const v = this.form.attributes[d.code];
          return v !== undefined && v !== null && v !== '';
        });
    }
    return true;
  }

  get summaryCategory() {
    return this.categories.find(c => c.value === this.form.category);
  }

  get summarySubcategory() {
    return this.subcategories.find(s => s.id === this.form.subcategoryId);
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
  }

  removeExisting(index: number) {
    this.existingImages.splice(index, 1);
  }

  async publish() {
    if (!this.auth.isLoggedIn) { this.router.navigate(['/auth/login']); return; }
    this.loading = true;
    this.error = '';

    try {
      // Upload newly selected images to Cloudinary first
      let newUrls: string[] = [];
      if (this.selectedFiles.length > 0) {
        this.uploading = true;
        const result = await new Promise<{ urls: string[] }>((resolve, reject) => {
          this.uploadService.uploadImages(this.selectedFiles).subscribe({ next: resolve, error: reject });
        });
        newUrls = result.urls;
        this.uploading = false;
      }
      const images = [...this.existingImages, ...newUrls];

      const payload = {
        title: this.form.title,
        description: this.form.description,
        price: this.form.price ? +this.form.price : undefined,
        currency: this.form.currency,
        category: this.form.category as Category,
        subcategoryId: this.form.subcategoryId || undefined,
        condition: this.form.condition || undefined,
        city: this.form.city,
        images,
        phone: this.form.phone,
        whatsapp: this.form.whatsapp,
        attributes: this.form.attributes,
      };

      const request$ = this.isEdit ? this.ls.update(this.editId!, payload) : this.ls.create(payload);
      request$.subscribe({
        next: listing => {
          this.loading = false;
          this.success = true;
          this.cdr.markForCheck();
          setTimeout(() => this.router.navigate(['/annonces', listing.id]), 2000);
        },
        error: () => {
          this.loading = false;
          this.error = this.i18n.t('deposer.error_publish');
          this.cdr.markForCheck();
        }
      });
    } catch {
      this.uploading = false;
      this.loading = false;
      this.error = this.i18n.t('deposer.error_upload');
      this.cdr.markForCheck();
    }
  }
}
