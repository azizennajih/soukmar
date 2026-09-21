import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { I18nService } from '../../services/i18n.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { IconComponent } from '../../components/icon/icon.component';
import { ListingCardComponent } from '../../components/listing-card/listing-card.component';
import { ListingService } from '../../services/listing.service';
import { ImageSearchService } from '../../services/image-search.service';
import { Listing } from '../../models/listing.model';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-image-search',
  imports: [CommonModule, RouterLink, TranslatePipe, IconComponent, ListingCardComponent],
  templateUrl: './image-search.component.html',
  styleUrl: './image-search.component.scss'
})
export class ImageSearchComponent implements OnInit {
  i18n = inject(I18nService);
  private cdr = inject(ChangeDetectorRef);

  previewUrl: string | null = null;
  results: Listing[] = [];
  loading = false;
  searched = false;
  errorMsg = '';

  constructor(private listingService: ListingService, private imageSearchService: ImageSearchService) {}

  ngOnInit() {
    const file = this.imageSearchService.consumePendingFile();
    if (file) this.runSearch(file);
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) this.runSearch(file);
    input.value = '';
  }

  async runSearch(file: File) {
    this.previewUrl = URL.createObjectURL(file);
    this.loading = true;
    this.searched = true;
    this.errorMsg = '';
    this.results = [];
    this.cdr.markForCheck();
    try {
      this.results = await firstValueFrom(this.listingService.searchByImage(file));
    } catch {
      this.errorMsg = this.i18n.t('image_search.error');
    } finally {
      this.loading = false;
      this.cdr.markForCheck();
    }
  }
}
