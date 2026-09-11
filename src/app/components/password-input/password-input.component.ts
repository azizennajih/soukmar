import { Component, Input, Output, EventEmitter, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../pipes/translate.pipe';

const AUTO_HIDE_MS = 8000;

/** Password field with a reveal/hide eye toggle — drop-in replacement for a
 * plain <input type="password"> ([value]/(valueChange), not ngModel, same
 * convention as app-phone-input / app-city-select). Revealing the password
 * auto-hides it again after a few seconds so it doesn't stay in plaintext
 * on screen if the user walks away. */
@Component({
  selector: 'app-password-input',
  imports: [CommonModule, TranslatePipe],
  templateUrl: './password-input.component.html',
  styleUrl: './password-input.component.scss'
})
export class PasswordInputComponent implements OnDestroy {
  @Input() value = '';
  @Input() placeholder = '';
  @Input() name = 'password';
  @Input() required = true;
  @Input() autocomplete: 'current-password' | 'new-password' = 'current-password';
  /** Reserves left padding for a page-supplied lock icon in an
   * .input-icon-wrap wrapper (the login/reset-password style). */
  @Input() indent = false;
  @Output() valueChange = new EventEmitter<string>();

  visible = signal(false);
  private hideTimer?: ReturnType<typeof setTimeout>;

  toggle() {
    this.visible.update(v => !v);
    this.restartTimer();
  }

  onInput(event: Event) {
    this.valueChange.emit((event.target as HTMLInputElement).value);
    if (this.visible()) this.restartTimer();
  }

  private restartTimer() {
    clearTimeout(this.hideTimer);
    if (this.visible()) {
      this.hideTimer = setTimeout(() => this.visible.set(false), AUTO_HIDE_MS);
    }
  }

  ngOnDestroy() {
    clearTimeout(this.hideTimer);
  }
}
