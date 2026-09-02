import { Component, ElementRef, HostListener, Input, Output, EventEmitter, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../pipes/translate.pipe';

const DIACRITICS = /[̀-ͯ]/g;

function normalize(s: string): string {
  return s.normalize('NFD').replace(DIACRITICS, '').toLowerCase();
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

  private host = inject(ElementRef<HTMLElement>);

  open = signal(false);
  query = signal('');
  activeIndex = signal(-1);

  filtered = computed(() => {
    const q = normalize(this.query());
    const list = q ? this.cities.filter(c => normalize(c).includes(q)) : this.cities;
    return list.slice(0, 50);
  });

  get displayValue(): string {
    return this.open() ? this.query() : this.value;
  }

  onFocus() {
    this.query.set('');
    this.activeIndex.set(-1);
    this.open.set(true);
  }

  onInput(v: string) {
    this.query.set(v);
    this.activeIndex.set(-1);
    if (!this.open()) this.open.set(true);
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
      if (!this.open()) { this.open.set(true); return; }
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
}
