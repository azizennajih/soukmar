import { Injectable, signal, effect, inject } from '@angular/core';
import { BrowserStorageService } from './browser-storage.service';
import { isKnownCountry } from '../models/country.model';

const COUNTRY_KEY = 'soukmar_country';

/** The country a visitor is browsing/listing in — deliberately independent
 * of I18nService (country ≠ language: a French speaker might browse
 * Morocco, an Arabic speaker might browse France). Persisted the same way
 * as the language choice: browser-local only, not tied to the account. */
@Injectable({ providedIn: 'root' })
export class CountryService {
  private storage = inject(BrowserStorageService);

  country = signal<string>(
    isKnownCountry(this.storage.getItem(COUNTRY_KEY) ?? '')
      ? this.storage.getItem(COUNTRY_KEY)!
      : 'MA'
  );

  constructor() {
    effect(() => this.storage.setItem(COUNTRY_KEY, this.country()));
  }

  setCountry(code: string) {
    this.country.set(code);
  }
}
