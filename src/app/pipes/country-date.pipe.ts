import { Pipe, PipeTransform, inject } from '@angular/core';
import { CountryService } from '../services/country.service';
import { formatDateForCountry } from '../models/date-format';

/** Numeric date in the browsing country's own format (05.12.2026 / 12/05/2026 / 2026/12/05). */
@Pipe({ name: 'countryDate', standalone: true, pure: false })
export class CountryDatePipe implements PipeTransform {
  private country = inject(CountryService);

  transform(value: Date | string | number | null | undefined, withYear = true): string {
    if (value == null || value === '') return '';
    // Reading the signal makes Angular re-render when the country changes.
    return formatDateForCountry(value, this.country.country(), withYear);
  }
}
