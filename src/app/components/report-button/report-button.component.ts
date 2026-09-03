import { Component, Input, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportService } from '../../services/report.service';
import { I18nService } from '../../services/i18n.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-report-button',
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './report-button.component.html',
  styleUrl: './report-button.component.scss'
})
export class ReportButtonComponent {
  @Input({ required: true }) reportedId!: string;
  @Input() listingId?: string;
  /** Compact style for tight spaces like the chat header. */
  @Input() compact = false;

  private reportService = inject(ReportService);
  i18n = inject(I18nService);

  open = signal(false);
  reason = '';
  submitting = signal(false);
  submitted = signal(false);
  error = signal('');

  submit() {
    if (this.reason.trim().length < 10) { this.error.set(this.i18n.t('report.error_too_short')); return; }
    this.submitting.set(true);
    this.error.set('');
    this.reportService.submit({ listingId: this.listingId, reportedId: this.reportedId, reason: this.reason.trim() }).subscribe({
      next: () => {
        this.submitting.set(false);
        this.submitted.set(true);
        this.open.set(false);
      },
      error: (e) => {
        this.submitting.set(false);
        this.error.set(e?.error?.error || this.i18n.t('report.error_generic'));
      }
    });
  }

  cancel() {
    this.open.set(false);
    this.error.set('');
  }
}
