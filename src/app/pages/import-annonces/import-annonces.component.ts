import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { LocalizedRouterLinkDirective } from '../../directives/localized-router-link.directive';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { I18nService } from '../../services/i18n.service';
import { ToastService } from '../../services/toast.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { IconComponent } from '../../components/icon/icon.component';
import { CATEGORIES } from '../../models/listing.model';
import { parseCsv } from './csv';

const COLUMNS = ['title', 'description', 'price', 'category', 'city', 'region', 'condition', 'phone', 'whatsapp', 'images'];
/** Must match MAX_BULK_ROWS_PER_REQUEST in the backend (lib/bulkImport.ts). */
const CHUNK = 10;
const MAX_ROWS = 300;

interface RowResult { row: number; title: string; status: 'created' | 'skipped' | 'failed'; reason?: string }

@Component({
  selector: 'app-import-annonces',
  imports: [RouterLink, LocalizedRouterLinkDirective, TranslatePipe, IconComponent],
  templateUrl: './import-annonces.component.html',
  styleUrl: './import-annonces.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImportAnnoncesComponent implements OnInit {
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private toast = inject(ToastService);
  i18n = inject(I18nService);

  readonly max = MAX_ROWS;
  readonly categoryCodes = CATEGORIES.map(c => c.value).join(', ');
  rows: Record<string, string>[] = [];
  fileName = '';
  importing = false;
  done = 0;
  results: RowResult[] = [];

  get isBusiness(): boolean { return this.auth.currentUser()?.accountType === 'BUSINESS'; }
  get finished(): boolean { return !this.importing && this.results.length > 0; }
  count(status: RowResult['status']): number { return this.results.filter(r => r.status === status).length; }

  ngOnInit() {
    if (!this.auth.isLoggedIn) this.router.navigate(this.i18n.withLang(['/auth/login']));
  }

  downloadTemplate() {
    const example = ['Dacia Logan 2019', 'Gepflegt, 85 000 km, Diesel', '95000', 'VEHICLES', 'Casablanca', '', 'USED', '', '', 'https://example.com/foto1.jpg|https://example.com/foto2.jpg'];
    const csv = '﻿' + [COLUMNS, example].map(r => r.map(v => `"${v.replace(/"/g, '""')}"`).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'souqmar24-import-vorlage.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  async onFile(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    this.results = [];
    this.rows = [];
    this.fileName = file?.name ?? '';
    if (!file) { this.cdr.markForCheck(); return; }
    try {
      const rows = parseCsv(await file.text());
      if (rows.length === 0) throw new Error('empty');
      if (rows.length > MAX_ROWS) { this.toast.error(this.i18n.t('bulk_import.too_many', { max: String(MAX_ROWS) })); }
      else this.rows = rows;
    } catch {
      this.toast.error(this.i18n.t('bulk_import.read_error'));
    }
    this.cdr.markForCheck();
  }

  async start() {
    if (this.importing || this.rows.length === 0) return;
    this.importing = true;
    this.done = 0;
    this.results = [];
    try {
      for (let i = 0; i < this.rows.length; i += CHUNK) {
        const chunk = this.rows.slice(i, i + CHUNK);
        const res = await firstValueFrom(this.api.post<{ results: RowResult[] }>('/business-import', { listings: chunk, rowOffset: i }));
        this.results = [...this.results, ...res.results];
        this.done = Math.min(i + CHUNK, this.rows.length);
        this.cdr.markForCheck();
      }
      this.rows = [];
    } catch {
      this.toast.error(this.i18n.t('bulk_import.error'));
    } finally {
      this.importing = false;
      this.cdr.markForCheck();
    }
  }

  reasonText(r: RowResult): string {
    return r.reason === 'duplicate' ? this.i18n.t('bulk_import.duplicate') : (r.reason ?? '');
  }
}
