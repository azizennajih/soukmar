import { Component, ElementRef, HostListener, Input, Output, EventEmitter, ViewChild, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { FlagIconComponent } from '../flag-icon/flag-icon.component';
import { I18nService } from '../../services/i18n.service';
import { DIAL_CODES, dialCodeByIso, dialCodeLabel } from '../../models/dial-codes';

const DIACRITICS = /[̀-ͯ]/g;

function normalize(s: string): string {
  return s.normalize('NFD').replace(DIACRITICS, '').toLowerCase();
}

interface PanelStyle {
  top: string;
  left: string;
  width: string;
}

/** Flag + dial code trigger that opens a searchable country dropdown —
 * mirrors the floating-panel pattern from app-city-select, minus the
 * free-text/GPS bits that don't apply to picking a fixed dial code. */
@Component({
  selector: 'app-country-code-select',
  imports: [CommonModule, TranslatePipe, FlagIconComponent],
  templateUrl: './country-code-select.component.html',
  styleUrl: './country-code-select.component.scss'
})
export class CountryCodeSelectComponent {
  @Input() value = 'MA';
  @Output() valueChange = new EventEmitter<string>();

  @ViewChild('trigger') trigger!: ElementRef<HTMLElement>;

  private host = inject(ElementRef<HTMLElement>);
  private i18n = inject(I18nService);

  open = signal(false);
  query = signal('');
  activeIndex = signal(-1);
  panelStyle = signal<PanelStyle>({ top: '0px', left: '0px', width: '0px' });

  options = DIAL_CODES;

  get selected() {
    return dialCodeByIso(this.value);
  }

  labelFor(iso: string): string {
    return dialCodeLabel(iso, this.i18n.lang());
  }

  filtered = computed(() => {
    const q = normalize(this.query());
    const lang = this.i18n.lang();
    if (!q) return this.options;
    return this.options.filter(o =>
      normalize(dialCodeLabel(o.iso, lang)).includes(q) || o.dialCode.replace('+', '').includes(q)
    );
  });

  private anchorStyle(): PanelStyle {
    const rect = this.trigger.nativeElement.getBoundingClientRect();
    return {
      top: `${rect.bottom + 6}px`,
      left: `${rect.left}px`,
      width: `${Math.max(rect.width, 240)}px`,
    };
  }

  toggle() {
    if (this.open()) { this.close(); return; }
    this.query.set('');
    this.activeIndex.set(-1);
    this.panelStyle.set(this.anchorStyle());
    this.open.set(true);
  }

  private close() {
    this.open.set(false);
  }

  onSearchInput(v: string) {
    this.query.set(v);
    this.activeIndex.set(-1);
  }

  select(iso: string) {
    this.value = iso;
    this.valueChange.emit(iso);
    this.query.set('');
    this.close();
  }

  onKeydown(e: KeyboardEvent) {
    const list = this.filtered();
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      this.activeIndex.set(Math.min(this.activeIndex() + 1, list.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      this.activeIndex.set(Math.max(this.activeIndex() - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const i = this.activeIndex();
      if (i >= 0 && i < list.length) this.select(list[i]!.iso);
    } else if (e.key === 'Escape') {
      this.close();
      (e.target as HTMLElement).blur();
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(e: MouseEvent) {
    if (!this.host.nativeElement.contains(e.target as Node)) this.close();
  }

  @HostListener('window:scroll')
  @HostListener('window:resize')
  onViewportChange() {
    if (this.open()) this.close();
  }
}
