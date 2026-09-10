import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CountryCodeSelectComponent } from '../country-code-select/country-code-select.component';
import { parsePhone, composePhone } from '../../models/dial-codes';

/** Country-code picker + local number field that together compose one
 * dial-code-prefixed string (e.g. "+212612345678") for storage — drop-in
 * replacement for a plain <input type="tel">, wired the same way as
 * app-city-select ([value]/(valueChange), not ngModel). */
@Component({
  selector: 'app-phone-input',
  imports: [CommonModule, CountryCodeSelectComponent],
  templateUrl: './phone-input.component.html',
  styleUrl: './phone-input.component.scss'
})
export class PhoneInputComponent implements OnChanges {
  @Input() value = '';
  @Input() placeholder = '';
  @Output() valueChange = new EventEmitter<string>();

  iso = 'MA';
  localNumber = '';

  ngOnChanges(changes: SimpleChanges) {
    if (!changes['value']) return;
    const incoming = this.value ?? '';
    // Skip re-parsing our own emitted value — otherwise every keystroke would
    // round-trip through composePhone (which strips the leading "0") and
    // immediately rewrite what the user just typed out from under them.
    if (incoming === composePhone(this.iso, this.localNumber)) return;
    const parsed = parsePhone(incoming);
    this.iso = parsed.iso;
    this.localNumber = parsed.localNumber;
  }

  onCountryChange(iso: string) {
    this.iso = iso;
    this.emitValue();
  }

  onLocalNumberChange(v: string) {
    this.localNumber = v;
    this.emitValue();
  }

  private emitValue() {
    this.valueChange.emit(composePhone(this.iso, this.localNumber));
  }
}
