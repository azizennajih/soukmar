import { Component, ElementRef, HostListener, Input, Output, EventEmitter, ViewChild, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { I18nService } from '../../services/i18n.service';

const DIACRITICS = /[̀-ͯ]/g;

function normalize(s: string): string {
  return s.normalize('NFD').replace(DIACRITICS, '').toLowerCase();
}

interface PanelStyle {
  top: string;
  left: string;
  width: string;
}

@Component({
  selector: 'app-multi-select',
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './multi-select.component.html',
  styleUrl: './multi-select.component.scss'
})
export class MultiSelectComponent {
  @Input() options: string[] = [];
  @Input() selected: string[] = [];
  /** i18n key prefix applied to each option code, e.g. 'attrs.opts.' */
  @Input() labelPrefix = '';
  @Input() placeholder = '';
  @Output() selectedChange = new EventEmitter<string[]>();

  @ViewChild('fieldWrap') fieldWrap!: ElementRef<HTMLElement>;

  private host = inject(ElementRef<HTMLElement>);
  private i18n = inject(I18nService);

  open = signal(false);
  query = signal('');
  panelStyle = signal<PanelStyle>({ top: '0px', left: '0px', width: '0px' });

  filtered = computed(() => {
    const q = normalize(this.query());
    if (!q) return this.options;
    return this.options.filter(o => normalize(this.i18n.t(this.labelPrefix + o)).includes(q));
  });

  get summary(): string {
    if (!this.selected.length) return this.placeholder;
    if (this.selected.length === 1) return this.i18n.t(this.labelPrefix + this.selected[0]);
    return `${this.selected.length} ${this.i18n.t('common.selected')}`;
  }

  toggle() {
    this.open() ? this.close() : this.openPanel();
  }

  private openPanel() {
    const rect = this.fieldWrap.nativeElement.getBoundingClientRect();
    this.panelStyle.set({
      top: `${rect.bottom + 6}px`,
      left: `${rect.left}px`,
      width: `${rect.width}px`,
    });
    this.query.set('');
    this.open.set(true);
  }

  close() {
    this.open.set(false);
  }

  isChecked(opt: string): boolean {
    return this.selected.includes(opt);
  }

  toggleOption(opt: string, checked: boolean) {
    const next = checked ? [...this.selected, opt] : this.selected.filter(o => o !== opt);
    this.selectedChange.emit(next);
  }

  clear(e: Event) {
    e.stopPropagation();
    this.selectedChange.emit([]);
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
