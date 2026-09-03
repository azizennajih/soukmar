import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { I18nService } from '../../../services/i18n.service';
import { TranslatePipe } from '../../../pipes/translate.pipe';

@Component({
  selector: 'app-register',
  imports: [CommonModule, RouterLink, FormsModule, TranslatePipe],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  private auth = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);
  i18n = inject(I18nService);

  form = { name: '', email: '', phone: '', city: '', password: '', confirm: '' };
  showPass = false;
  loading = false;
  error = '';
  emailSent = false;
  registeredEmail = '';
  resendLoading = false;
  resendOk = false;

  async submit() {
    if (this.form.password !== this.form.confirm) {
      this.error = this.i18n.t('deposer.error_required'); return;
    }
    if (this.form.password.length < 6) {
      this.error = this.i18n.t('deposer.error_required'); return;
    }
    this.loading = true;
    this.error = '';
    try {
      const result = await this.auth.register(
        this.form.name, this.form.email, this.form.password,
        this.form.phone, this.form.city
      );
      if (result.ok && result.emailSent) {
        this.registeredEmail = this.form.email;
        this.emailSent = true;
      } else {
        this.error = result.error || 'Une erreur est survenue.';
      }
    } catch {
      this.error = 'Une erreur inattendue est survenue.';
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
