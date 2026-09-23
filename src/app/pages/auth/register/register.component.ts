import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LocalizedRouterLinkDirective } from '../../../directives/localized-router-link.directive';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { I18nService } from '../../../services/i18n.service';
import { TranslatePipe } from '../../../pipes/translate.pipe';
import { TurnstileComponent } from '../../../components/turnstile/turnstile.component';
import { IconComponent } from '../../../components/icon/icon.component';
import { PhoneInputComponent } from '../../../components/phone-input/phone-input.component';
import { PasswordInputComponent } from '../../../components/password-input/password-input.component';
import { VISIBLE_COUNTRY_REGIONS, countryName } from '../../../models/country.model';
import { CountryService } from '../../../services/country.service';
import { parsePhone, composePhone } from '../../../models/dial-codes';

@Component({
  selector: 'app-register',
  imports: [CommonModule, RouterLink, LocalizedRouterLinkDirective, FormsModule, TranslatePipe, TurnstileComponent, IconComponent, PhoneInputComponent, PasswordInputComponent],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  private auth = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);
  private countryService = inject(CountryService);
  i18n = inject(I18nService);

  countryRegions = VISIBLE_COUNTRY_REGIONS;
  countryName = countryName;

  form = {
    name: '', email: '',
    country: this.countryService.country(),
    phone: '',
    city: '', password: '', confirm: '', accountType: '' as '' | 'PRIVATE' | 'BUSINESS'
  };

  regionLabelKey(region: string): string {
    return 'deposer.region_' + region.toLowerCase();
  }

  /** Picking a country updates app-phone-input's [defaultIso] (see there for
   * why that's a separate input from the phone value itself), which shows
   * the matching dial code immediately even before anything is typed. Any
   * digits already typed keep their own prefix in sync too. */
  onCountryChange(code: string) {
    this.form.country = code;
    const { localNumber } = parsePhone(this.form.phone);
    this.form.phone = composePhone(code, localNumber);
  }
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
