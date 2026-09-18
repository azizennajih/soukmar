import { Component, Input, Output, EventEmitter, OnChanges, OnDestroy, SimpleChanges, ChangeDetectorRef, ElementRef, HostListener, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, Subscription, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { ListingService, SearchSuggestions } from '../../services/listing.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { I18nService } from '../../services/i18n.service';

interface PanelStyle { top: string; left: string; width: string; }
export interface SuggestionItem { q: string; category?: string; suffix: string }

@Component({
  selector: 'app-search-suggestions',
  imports: [CommonModule, TranslatePipe],
  templateUrl: './search-suggestions.component.html',
  styleUrl: './search-suggestions.component.scss'
})
export class SearchSuggestionsComponent implements OnChanges, OnDestroy {
  @Input() query = '';
  /** Only shows the dropdown while the owning input is focused — set by the
   * parent on (focus)/(blur) so suggestions from a previous field don't
   * linger visible after the user tabs away. */
  @Input() active = false;
  @Output() pick = new EventEmitter<{ q: string; category?: string }>();

  private ls = inject(ListingService);
  private i18n = inject(I18nService);
  private cdr = inject(ChangeDetectorRef);
  private host = inject(ElementRef<HTMLElement>);

  private query$ = new Subject<string>();
  private sub: Subscription;

  suggestions: SearchSuggestions | null = null;
  // Rendered position: fixed, not absolute — several search bars this drops
  // into (e.g. the navbar's rounded search pill) clip overflowing children,
  // so the panel is anchored to the input's own wrapper via getBoundingClientRect(),
  // mirroring CitySelectComponent's identical fixed-panel approach.
  panelStyle = signal<PanelStyle>({ top: '0px', left: '0px', width: '0px' });
  visible = signal(false);
  /** Keyboard-highlighted row, mirroring CitySelectComponent's own
   * ArrowUp/ArrowDown/Enter handling so both dropdowns behave the same way. */
  activeIndex = signal(-1);

  constructor() {
    this.sub = this.query$.pipe(
      debounceTime(250),
      distinctUntilChanged(),
      switchMap(q => {
        if (q.trim().length < 2) return of(null);
        return this.ls.getSuggestions(q.trim()).pipe(catchError(() => of(null)));
      })
    ).subscribe(res => {
      this.suggestions = res;
      this.activeIndex.set(-1);
      this.cdr.markForCheck();
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['query']) { this.query$.next(this.query); this.activeIndex.set(-1); }
    if (changes['active']) {
      if (this.active) { this.updatePosition(); this.visible.set(true); }
      else this.visible.set(false);
    }
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  private updatePosition() {
    const anchor = this.host.nativeElement.parentElement;
    if (!anchor) return;
    const rect = anchor.getBoundingClientRect();
    this.panelStyle.set({ top: `${rect.bottom + 6}px`, left: `${rect.left}px`, width: `${rect.width}px` });
  }

  // Closing on scroll/resize rather than repositioning matches
  // CitySelectComponent's own panel — simpler than tracking every ancestor
  // that could scroll, and the field is still focused for a quick reopen.
  @HostListener('window:scroll')
  @HostListener('window:resize')
  onViewportChange() {
    this.visible.set(false);
  }

  get show(): boolean {
    if (!this.visible() || this.query.trim().length < 2 || !this.suggestions) return false;
    return this.suggestions.categories.length > 0 || this.suggestions.phrases.length > 0;
  }

  categoryLabel(cat: string): string {
    return this.i18n.t('cats.' + cat);
  }

  /** Single flat list backing both the rendered rows and the keyboard-nav
   * index, so ArrowDown/Enter always land on exactly what's on screen. */
  get items(): SuggestionItem[] {
    if (!this.suggestions) return [];
    const inAll = this.i18n.t('nav.suggest_in_all');
    const inCat = this.i18n.t('nav.suggest_in');
    return [
      { q: this.query, suffix: inAll },
      ...this.suggestions.phrases.map(phrase => ({ q: phrase, suffix: inAll })),
      ...this.suggestions.categories.map(c => ({ q: this.query, category: c.category, suffix: `${inCat} ${this.categoryLabel(c.category)}` })),
    ];
  }

  /** Called from the owning input's (keydown) via a template reference —
   * the input lives in the parent's template, this component just supplies
   * the list to navigate. */
  onKeydown(e: KeyboardEvent) {
    if (!this.show) return;
    const items = this.items;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      this.activeIndex.set(Math.min(this.activeIndex() + 1, items.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      this.activeIndex.set(Math.max(this.activeIndex() - 1, 0));
    } else if (e.key === 'Enter') {
      const i = this.activeIndex();
      if (i >= 0 && i < items.length) {
        e.preventDefault();
        this.select(items[i]!.q, items[i]!.category);
      }
    } else if (e.key === 'Escape') {
      this.visible.set(false);
    }
  }

  select(q: string, category?: string) {
    this.pick.emit({ q, category });
  }
}
