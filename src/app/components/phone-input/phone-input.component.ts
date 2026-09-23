import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CountryCodeSelectComponent } from '../country-code-select/country-code-select.component';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { parsePhone, composePhone, localNumberLengthRange } from '../../models/dial-codes';

/** Country-code picker + local number field that together compose one
 * dial-code-prefixed string (e.g. "+212612345678") for storage — drop-in
 * replacement for a plain <input type="tel">, wired the same way as
 * app-city-select ([value]/(valueChange), not ngModel). */
@Component({
  selector: 'app-phone-input',
  imports: [CommonModule, CountryCodeSelectComponent, TranslatePipe],
  templateUrl: './phone-input.component.html',
  styleUrl: './phone-input.component.scss'
})
export class PhoneInputComponent implements OnChanges {
  @Input() value = '';
  @Input() placeholder = '';
  /** Which dial code to show while the field is still empty (e.g. driven by
   * a separate "country" picker elsewhere in the same form) — composePhone()
   * deliberately returns '' for an empty local number (so clearing the phone
   * field never stores a bogus dial-code-only value), so that string alone
   * can't carry this hint; a distinct input is needed instead. Ignored once
   * there's an actual number, typed or loaded, so it never fights the real
   * value's own embedded country code. */
  @Input() defaultIso = 'MA';
  @Output() valueChange = new EventEmitter<string>();

  iso = 'MA';
  localNumber = '';

  ngOnChanges(changes: SimpleChanges) {
    if (changes['value']) {
      const incoming = this.value ?? '';
      // Skip re-parsing our own emitted value — otherwise every keystroke would
      // round-trip through composePhone (which strips the leading "0") and
      // immediately rewrite what the user just typed out from under them.
      if (incoming !== composePhone(this.iso, this.localNumber)) {
        const parsed = parsePhone(incoming);
        this.iso = parsed.iso;
        this.localNumber = parsed.localNumber;
      }
    }
    if (changes['defaultIso'] && !this.localNumber) {
      this.iso = this.defaultIso;
    }
  }

  onCountryChange(iso: string) {
    this.iso = iso;
    this.emitValue();
  }

  /** Shown only once the user has typed something — an empty required field
   * has its own "required" validation elsewhere, this is purely about length. */
  get lengthError(): { min: number; max: number } | null {
    if (!this.localNumber) return null;
    const [min, max] = localNumberLengthRange(this.iso);
    const len = this.localNumber.length;
    return len >= min && len <= max ? null : { min, max };
  }

  onLocalNumberChange(v: string) {
    this.localNumber = v;
    this.emitValue();
  }

  private emitValue() {
    this.valueChange.emit(composePhone(this.iso, this.localNumber));
  }
}
