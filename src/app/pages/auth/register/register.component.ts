import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { I18nService } from '../../../services/i18n.service';
import { TranslatePipe } from '../../../pipes/translate.pipe';
import { TurnstileComponent } from '../../../components/turnstile/turnstile.component';
import { IconComponent } from '../../../components/icon/icon.component';
import { PhoneInputComponent } from '../../../components/phone-input/phone-input.component';

@Component({
  selector: 'app-register',
  imports: [CommonModule, RouterLink, FormsModule, TranslatePipe, TurnstileComponent, IconComponent, PhoneInputComponent],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  private auth = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);
  i18n = inject(I18nService);

  form = { name: '', email: '', phone: '', city: '', password: '', confirm: '', accountType: '' as '' | 'PRIVATE' | 'BUSINESS' };
  showPass = false;
  loading = false;
  error = '';
  emailSent = false;
  emailSendFailed = false;
  registeredEmail = '';
  resendLoading = false;
  resendOk = false;
  captchaToken = '';

  async submit() {
    if (!this.form.accountType) {
      this.error = this.i18n.t('auth.account_type_required'); return;
    }
    if (this.form.password !== this.form.confirm) {
      this.error = this.i18n.t('auth.reset_mismatch'); return;
    }
    if (this.form.password.length < 6) {
      this.error = this.i18n.t('auth.reset_too_short'); return;
    }
    if (!this.captchaToken) {
      this.error = this.i18n.t('auth.captcha_required'); return;
    }
    this.loading = true;
    this.error = '';
    try {
      const result = await this.auth.register(
        this.form.name, this.form.email, this.form.password,
        this.form.phone, this.form.city, this.captchaToken, this.form.accountType || undefined
      );
      if (result.ok) {
        this.registeredEmail = this.form.email;
        this.emailSent = true;
        this.emailSendFailed = !result.emailSent;
      } else {
        this.error = result.error || this.i18n.t('auth.generic_error_retry');
      }
    } catch {
      this.error = this.i18n.t('auth.unexpected_error');
    } finally {
      this.loading = false;
      this.cdr.markForCheck();
    }
  }

  async resend() {
    if (this.resendLoading) return;
    this.resendLoading = true;
    this.resendOk = false;
    const result = await this.auth.resendVerification(this.registeredEmail);
    this.resendLoading = false;
    if (result.ok) this.resendOk = true;
    this.cdr.markForCheck();
  }
}
