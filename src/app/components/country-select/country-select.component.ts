import { Component, ElementRef, HostListener, Input, Output, EventEmitter, ViewChild, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { FlagIconComponent } from '../flag-icon/flag-icon.component';
import { I18nService } from '../../services/i18n.service';
import { COUNTRIES, countryName } from '../../models/country.model';

const DIACRITICS = /[̀-ͯ]/g;

function normalize(s: string): string {
  return s.normalize('NFD').replace(DIACRITICS, '').toLowerCase();
}

interface PanelStyle {
  top: string;
  left: string;
  width: string;
}

/** Searchable country picker — flag icons via app-flag-icon (Unicode flag
 * emoji render as plain "MA"-style text on Windows Chrome without the right
 * font, same problem app-country-code-select already solves for phone dial
 * codes) and free typing to filter, mirroring app-city-select's own
 * type-to-search behavior rather than a plain click-through list. Options
 * are pinned Morocco-first then continent order (COUNTRIES' own order) when
 * the search box is empty, alphabetical-by-relevance once the user types. */
@Component({
  selector: 'app-country-select',
  imports: [CommonModule, TranslatePipe, FlagIconComponent],
  templateUrl: './country-select.component.html',
  styleUrl: './country-select.component.scss'
})
export class CountrySelectComponent {
  @Input() value = 'MA';
  @Input() placeholder = '';
  @Output() valueChange = new EventEmitter<string>();

  @ViewChild('trigger') trigger!: ElementRef<HTMLElement>;

  private host = inject(ElementRef<HTMLElement>);
  private i18n = inject(I18nService);

  open = signal(false);
  query = signal('');
  activeIndex = signal(-1);
  panelStyle = signal<PanelStyle>({ top: '0px', left: '0px', width: '0px' });

  private codes = COUNTRIES.map(c => c.code);

  get selectedLabel(): string {
    return this.value ? countryName(this.value, this.i18n.lang()) : '';
  }

  labelFor(code: string): string {
    return countryName(code, this.i18n.lang());
  }

  filtered = computed(() => {
    const q = normalize(this.query());
    const lang = this.i18n.lang();
    if (!q) return this.codes;
    return this.codes.filter(code => normalize(countryName(code, lang)).includes(q));
  });

  private anchorStyle(): PanelStyle {
    const rect = this.trigger.nativeElement.getBoundingClientRect();
    return {
      top: `${rect.bottom + 6}px`,
      left: `${rect.left}px`,
      width: `${Math.max(rect.width, 260)}px`,
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

  select(code: string) {
    this.value = code;
    this.valueChange.emit(code);
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
      if (i >= 0 && i < list.length) this.select(list[i]!);
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
