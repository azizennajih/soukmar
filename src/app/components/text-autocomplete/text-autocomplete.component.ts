import { Component, ElementRef, HostListener, Input, Output, EventEmitter, ViewChild, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
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

// Free-text input with suggestions, e.g. job "Beruf" — unlike
// MultiSelectComponent this stores whatever the user actually typed, not
// just one of the suggested option codes: suggestions are a shortcut, never
// a constraint. Panel uses position:fixed so it isn't clipped by a
// scrollable ancestor (a filter sidebar, a form card) the way a native
// <datalist> popup would be.
@Component({
  selector: 'app-text-autocomplete',
  imports: [CommonModule, TranslatePipe],
  templateUrl: './text-autocomplete.component.html',
  styleUrl: './text-autocomplete.component.scss'
})
export class TextAutocompleteComponent {
  @Input() value = '';
  @Input() options: string[] = [];
  /** i18n key prefix applied to each option code, e.g. 'job_professions.' */
  @Input() labelPrefix = '';
  @Input() placeholder = '';
  @Output() valueChange = new EventEmitter<string>();

  @ViewChild('fieldWrap') fieldWrap!: ElementRef<HTMLElement>;

  private host = inject(ElementRef<HTMLElement>);
  private i18n = inject(I18nService);

  open = signal(false);
  panelStyle = signal<PanelStyle>({ top: '0px', left: '0px', width: '0px' });

  // A plain method, not a computed(): `value` and `options` are ordinary
  // @Input()s, not signals, so a computed() here would never see them
  // change and the list would stay frozen at whatever it first rendered.
  // Templates re-invoke this on every change-detection pass, which zoneless
  // OnPush still runs after the (input) event that updates `value`.
  filtered(): { code: string; label: string }[] {
    const q = normalize(this.value);
    const labeled = this.options.map(o => ({ code: o, label: this.i18n.t(this.labelPrefix + o) }));
    if (!q) return labeled;
    return labeled.filter(o => normalize(o.label).includes(q));
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

  close() {
    this.open.set(false);
  }

  onFocus() {
    this.openPanel();
  }

  onInput(text: string) {
    this.value = text;
    this.valueChange.emit(text);
    if (!this.open()) this.openPanel();
  }

  pick(label: string) {
    this.value = label;
    this.valueChange.emit(label);
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
