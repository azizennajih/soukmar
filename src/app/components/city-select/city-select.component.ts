import { Component, ElementRef, HostListener, Input, Output, EventEmitter, ViewChild, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../pipes/translate.pipe';

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
  selector: 'app-city-select',
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './city-select.component.html',
  styleUrl: './city-select.component.scss'
})
export class CitySelectComponent {
  @Input() cities: string[] = [];
  @Input() placeholder = '';
  @Input() value = '';
  @Output() valueChange = new EventEmitter<string>();

  @ViewChild('fieldWrap') fieldWrap!: ElementRef<HTMLElement>;

  private host = inject(ElementRef<HTMLElement>);

  open = signal(false);
  query = signal('');
  activeIndex = signal(-1);
  panelStyle = signal<PanelStyle>({ top: '0px', left: '0px', width: '0px' });

  filtered = computed(() => {
    const q = normalize(this.query());
    const list = q ? this.cities.filter(c => normalize(c).includes(q)) : this.cities;
    return list.slice(0, 50);
  });

  get displayValue(): string {
    return this.open() ? this.query() : this.value;
  }

  private openPanel() {
    const rect = this.fieldWrap.nativeElement.getBoundingClientRect();
    this.panelStyle.set({
      top: `${rect.bottom + 6}px`,
      left: `${rect.left}px`,
      width: `${rect.width}px`,
    });
    this.open.set(true);
  }

  onFocus() {
    this.query.set('');
    this.activeIndex.set(-1);
    this.openPanel();
  }

  onInput(v: string) {
    this.query.set(v);
    this.activeIndex.set(-1);
    if (!this.open()) this.openPanel();
  }

  select(city: string) {
    this.value = city;
    this.valueChange.emit(city);
    this.query.set('');
    this.open.set(false);
  }

  clear(e: Event) {
    e.stopPropagation();
    this.value = '';
    this.valueChange.emit('');
    this.query.set('');
  }

  onKeydown(e: KeyboardEvent) {
    const list = this.filtered();
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!this.open()) { this.openPanel(); return; }
      this.activeIndex.set(Math.min(this.activeIndex() + 1, list.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      this.activeIndex.set(Math.max(this.activeIndex() - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const i = this.activeIndex();
      if (i >= 0 && i < list.length) this.select(list[i]!);
    } else if (e.key === 'Escape') {
      this.query.set('');
      this.open.set(false);
      (e.target as HTMLElement).blur();
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(e: MouseEvent) {
    if (!this.host.nativeElement.contains(e.target as Node)) {
      this.open.set(false);
      this.query.set('');
    }
  }

  @HostListener('window:scroll')
  @HostListener('window:resize')
  onViewportChange() {
    if (this.open()) { this.open.set(false); this.query.set(''); }
  }
}
