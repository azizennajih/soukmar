import { Component, ElementRef, HostListener, Input, Output, EventEmitter, OnChanges, SimpleChanges, ViewChild, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { I18nService } from '../../services/i18n.service';
import { localeForLang } from '../../models/listing.model';

interface PanelStyle {
  top: string;
  left: string;
  width: string;
}

interface DayCell {
  date: number;
  month: number;
  year: number;
  otherMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
}

// A date field that reads/writes plain ISO ('YYYY-MM-DD') but never shows
// the browser/OS locale format the way a native <input type="date"> does —
// that format ignores the app's own language switcher entirely (a Chrome
// limitation, not something fixable via HTML attributes), so a user who
// switches SouqMar24 to Arabic or English still saw the picker in whatever
// format their OS happens to use. Here the numeric field order and the
// calendar's month/weekday names both follow `I18nService.lang()` instead.
@Component({
  selector: 'app-date-input',
  imports: [CommonModule, FormsModule],
  templateUrl: './date-input.component.html',
  styleUrl: './date-input.component.scss'
})
export class DateInputComponent implements OnChanges {
  @Input() value = '';
  @Output() valueChange = new EventEmitter<string>();

  @ViewChild('fieldWrap') fieldWrap!: ElementRef<HTMLElement>;

  private host = inject(ElementRef<HTMLElement>);
  private i18n = inject(I18nService);

  day = '';
  month = '';
  year = '';

  open = signal(false);
  panelStyle = signal<PanelStyle>({ top: '0px', left: '0px', width: '0px' });
  viewMonth = 0;
  viewYear = new Date().getFullYear();

  ngOnChanges(changes: SimpleChanges) {
    if (!changes['value']) return;
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(this.value ?? '');
    if (m) {
      this.year = m[1]!;
      this.month = m[2]!;
      this.day = m[3]!;
    } else {
      this.year = this.month = this.day = '';
    }
  }

  private static readonly DATE_PART_PLACEHOLDERS: Record<string, { day: string; month: string; year: string }> = {
    de: { day: 'tt', month: 'mm', year: 'jjjj' },
    fr: { day: 'jj', month: 'mm', year: 'aaaa' },
    es: { day: 'dd', month: 'mm', year: 'aaaa' },
    it: { day: 'gg', month: 'mm', year: 'aaaa' },
    ar: { day: '−−', month: '−−', year: '−−−−' },
  };

  get isEnglish(): boolean {
    return this.i18n.lang() === 'en';
  }

  get placeholders(): { day: string; month: string; year: string } {
    return DateInputComponent.DATE_PART_PLACEHOLDERS[this.i18n.lang()] ?? { day: 'DD', month: 'MM', year: 'YYYY' };
  }

  get weekdayNames(): string[] {
    const locale = localeForLang(this.i18n.lang());
    const fmt = new Intl.DateTimeFormat(locale, { weekday: 'short' });
    // 1970-01-05 was a Monday — start the header on Monday regardless of locale.
    return Array.from({ length: 7 }, (_, i) => fmt.format(new Date(1970, 0, 5 + i)));
  }

  get monthYearLabel(): string {
    const locale = localeForLang(this.i18n.lang());
    return new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(new Date(this.viewYear, this.viewMonth, 1));
  }

  get calendarDays(): DayCell[] {
    const first = new Date(this.viewYear, this.viewMonth, 1);
    const startOffset = (first.getDay() + 6) % 7; // Monday = 0
    const start = new Date(this.viewYear, this.viewMonth, 1 - startOffset);
    const today = new Date();
    const selDay = this.day ? Number(this.day) : null;
    const selMonth = this.month ? Number(this.month) : null;
    const selYear = this.year ? Number(this.year) : null;

    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
      return {
        date: d.getDate(),
        month: d.getMonth(),
        year: d.getFullYear(),
        otherMonth: d.getMonth() !== this.viewMonth,
        isToday: d.toDateString() === today.toDateString(),
        isSelected: selDay === d.getDate() && (selMonth ?? -1) === d.getMonth() + 1 && selYear === d.getFullYear(),
      };
    });
  }

  private emitIfComplete() {
    if (this.day && this.month && this.year && this.year.length === 4) {
      const d = this.day.padStart(2, '0');
      const m = this.month.padStart(2, '0');
      this.valueChange.emit(`${this.year}-${m}-${d}`);
    } else if (!this.day && !this.month && !this.year) {
      this.valueChange.emit('');
    }
  }

  onFieldInput(field: 'day' | 'month' | 'year', raw: string) {
    const digits = raw.replace(/\D/g, '').slice(0, field === 'year' ? 4 : 2);
    this[field] = digits;
    this.emitIfComplete();
  }

  toggle() {
    if (this.open()) { this.close(); return; }
    const y = this.year ? Number(this.year) : new Date().getFullYear();
    const m = this.month ? Number(this.month) - 1 : new Date().getMonth();
    this.viewYear = y;
    this.viewMonth = m;
    const rect = this.fieldWrap.nativeElement.getBoundingClientRect();
    this.panelStyle.set({ top: `${rect.bottom + 6}px`, left: `${rect.left}px`, width: `${Math.max(rect.width, 260)}px` });
    this.open.set(true);
  }

  close() {
    this.open.set(false);
  }

  prevMonth() {
    if (this.viewMonth === 0) { this.viewMonth = 11; this.viewYear--; } else { this.viewMonth--; }
  }

  nextMonth() {
    if (this.viewMonth === 11) { this.viewMonth = 0; this.viewYear++; } else { this.viewMonth++; }
  }

  pick(cell: DayCell) {
    this.day = String(cell.date).padStart(2, '0');
    this.month = String(cell.month + 1).padStart(2, '0');
    this.year = String(cell.year);
    this.emitIfComplete();
    this.close();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(e: MouseEvent) {
    if (this.open() && !this.host.nativeElement.contains(e.target as Node)) this.close();
  }

  @HostListener('window:scroll')
  @HostListener('window:resize')
  onViewportChange() {
    if (this.open()) this.close();
  }
}
