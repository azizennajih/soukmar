import { Pipe, PipeTransform, inject } from '@angular/core';
import { I18nService } from '../services/i18n.service';
import { cityLabel } from '../models/listing.model';

@Pipe({ name: 'cityLabel', standalone: true, pure: false })
export class CityLabelPipe implements PipeTransform {
  private i18n = inject(I18nService);

  transform(city: string | null | undefined): string {
    if (!city) return '';
    // Reading lang() makes Angular track this signal and re-run on change
    return cityLabel(city, this.i18n.lang());
  }
}
