import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { I18nService } from './i18n.service';

describe('language of a page with a language in its URL', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
  });

  it('is not swapped by the IP-based country guess', () => {
    const i18n = TestBed.inject(I18nService);
    i18n.setLangFromUrl('de');
    i18n.setLangFromCountry('US'); // a visitor (or crawler) browsing from the USA
    expect(i18n.lang()).toBe('de');
  });

  it('still lets the country guess pick a language when no page has set one', () => {
    const i18n = TestBed.inject(I18nService);
    i18n.setLangFromCountry('US');
    expect(i18n.lang()).toBe('en');
  });

  it('keeps a language chosen by hand', () => {
    const i18n = TestBed.inject(I18nService);
    i18n.chooseLang('es');
    i18n.setLangFromCountry('US');
    expect(i18n.lang()).toBe('es');
  });
});
