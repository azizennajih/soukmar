import { Component, ElementRef, HostListener, Input, Output, EventEmitter, ViewChild, inject, signal, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { GeocodeService, Coords } from '../../services/geocode.service';
import { I18nService } from '../../services/i18n.service';
import { cityLabel } from '../../models/listing.model';
import { PlaceService } from '../../services/place.service';

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
  /** A real signal input (not a plain @Input()) so `filtered` below actually
   * re-runs when the parent swaps the list (e.g. the navbar/annonces country
   * switcher) — a computed() only tracks *signal* reads, and a plain @Input
   * array read inside one silently goes stale whenever `query`/`lang` happen
   * not to change value on that same re-render (e.g. re-focusing an already-
   * empty field just calls query.set('') again, a no-op signal write). */
  cities = input<string[]>([]);
  /** ISO country code: when set, towns and villages of that country are suggested from the server as the user types (on top of `cities`). */
  country = input('');
  @Input() placeholder = '';
  @Input() value = '';
  @Input() showGps = false;
  /** Strips the field's own border/background so it blends into a parent chrome (e.g. the navbar search pill). */
  @Input() bare = false;
  /** Centers the field's label/input text instead of left-aligning it. */
  @Input() center = false;
  @Output() valueChange = new EventEmitter<string>();
  @Output() gpsSelected = new EventEmitter<Coords>();

  @ViewChild('fieldWrap') fieldWrap!: ElementRef<HTMLElement>;

  private host = inject(ElementRef<HTMLElement>);
  private geocodeService = inject(GeocodeService);
  private i18n = inject(I18nService);
  private places = inject(PlaceService);
  private searchTimer?: ReturnType<typeof setTimeout>;
  private searchSeq = 0;
  /** Server suggestions for the current query, with their region for the sub-label. */
  private remote = signal<{ name: string; admin1: string | null }[]>([]);

  open = signal(false);
  query = signal('');
  activeIndex = signal(-1);
  panelStyle = signal<PanelStyle>({ top: '0px', left: '0px', width: '0px' });
  errorStyle = signal<PanelStyle>({ top: '0px', left: '0px', width: '0px' });
  gpsLoading = signal(false);
  gpsError = signal(false);
  gpsErrorKey = signal('annonces.gps_error');

  filtered = computed(() => {
    const q = normalize(this.query());
    // Reading lang() makes Angular track this signal and re-run when the
    // Arabic labels below need to be (re)matched against the query.
    const lang = this.i18n.lang();
    // No cap: the panel scrolls (max-height + overflow-y), and capping the
    // unfiltered browse-all list broke it — the city list is alphabetical,
    // so a fixed slice only ever showed cities starting with "A".
    const cities = this.cities();
    const local = q
      ? cities.filter(c => normalize(c).includes(q) || normalize(cityLabel(c, lang)).includes(q))
      : cities;
    const extra = this.remote();
    if (!extra.length) return local;
    const known = new Set(local.map(normalize));
    return local.concat(extra.map(e => e.name).filter(n => !known.has(normalize(n))));
  });

  /** Region of a server-suggested place (tells apart the many villages sharing one name). */
  hint(city: string): string {
    return this.remote().find(e => e.name === city)?.admin1 ?? '';
  }

  /** Asks the server for matching towns/villages (debounced; stale answers are dropped). */
  private searchRemote(q: string) {
    const country = this.country();
    clearTimeout(this.searchTimer);
    if (!country || (!q.trim() && this.cities().length)) { this.remote.set([]); return; }
    const seq = ++this.searchSeq;
    this.searchTimer = setTimeout(() => {
      this.places.search(country, q.trim(), 30).subscribe({
        next: hits => { if (seq === this.searchSeq) this.remote.set(hits.map(h => ({ name: h.name, admin1: h.admin1 }))); },
        error: () => { if (seq === this.searchSeq) this.remote.set([]); },
      });
    }, q.trim() ? 200 : 0);
  }

  /** Arabic name in Arabic UI (falls back to the stored French/Latin city as-is
   * for any value outside the dictionary), otherwise that stored value unchanged. */
  labelFor(city: string): string {
    return cityLabel(city, this.i18n.lang());
  }

  get displayValue(): string {
    return this.open() ? this.query() : this.labelFor(this.value);
  }

  private anchorStyle(): PanelStyle {
    const rect = this.fieldWrap.nativeElement.getBoundingClientRect();
    return {
      top: `${rect.bottom + 6}px`,
      left: `${rect.left}px`,
      width: `${rect.width}px`,
    };
  }

  /** Centers the (variable-width) error box under the field instead of left-aligning it to it. */
  private anchorStyleCentered(): PanelStyle {
    const rect = this.fieldWrap.nativeElement.getBoundingClientRect();
    return {
      top: `${rect.bottom + 6}px`,
      left: `${rect.left + rect.width / 2}px`,
      width: `${rect.width}px`,
    };
  }

  private openPanel() {
    this.panelStyle.set(this.anchorStyle());
    this.open.set(true);
  }

  onFocus() {
    this.query.set('');
    this.activeIndex.set(-1);
    this.gpsError.set(false);
    this.searchRemote('');
    this.openPanel();
  }

  onInput(v: string) {
    this.query.set(v);
    this.searchRemote(v);
    this.activeIndex.set(-1);
    if (!this.open()) this.openPanel();
  }

  select(city: string) {
    this.value = city;
    this.valueChange.emit(city);
    this.query.set('');
    this.open.set(false);
  }

  /** Commits whatever the user typed as free text if they never explicitly picked a suggestion — mirrors a plain text input rather than silently discarding it. */
  private commitTypedQuery() {
    const q = this.query().trim();
    if (q && q !== this.value) {
      this.value = q;
      this.valueChange.emit(q);
    }
    this.query.set('');
  }

  clear(e: Event) {
    e.stopPropagation();
    this.value = '';
    this.valueChange.emit('');
    this.query.set('');
  }

  async useGps(e: Event) {
    e.stopPropagation();
    this.gpsError.set(false);
    this.gpsLoading.set(true);
    try {
      const coords = await this.geocodeService.getCurrentPosition();
      this.value = this.i18n.t('annonces.current_location');
      this.valueChange.emit(this.value);
      this.gpsSelected.emit(coords);
      this.open.set(false);
      this.query.set('');
    } catch (err) {
      const code = (err as GeolocationPositionError)?.code;
      this.gpsErrorKey.set(
        code === 1 ? 'annonces.gps_error_denied'
        : code === 3 ? 'annonces.gps_error_timeout'
        : 'annonces.gps_error'
      );
      this.errorStyle.set(this.anchorStyleCentered());
      this.gpsError.set(true);
    } finally {
      this.gpsLoading.set(false);
    }
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
      const i = this.activeIndex();
      if (i >= 0 && i < list.length) {
        e.preventDefault();
        this.select(list[i]!);
      } else {
        // No dropdown item highlighted — commit whatever was typed, then let
        // Enter bubble (e.g. submit an enclosing <form>).
        this.commitTypedQuery();
        this.open.set(false);
      }
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
      this.gpsError.set(false);
      this.commitTypedQuery();
    }
  }

  @HostListener('window:scroll')
  @HostListener('window:resize')
  onViewportChange() {
    if (this.open()) { this.open.set(false); this.commitTypedQuery(); }
  }
}
