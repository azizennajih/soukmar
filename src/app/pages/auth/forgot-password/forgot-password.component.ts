import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { I18nService } from '../../../services/i18n.service';
import { TranslatePipe } from '../../../pipes/translate.pipe';

@Component({
  selector: 'app-forgot-password',
  imports: [CommonModule, RouterLink, FormsModule, TranslatePipe],
  templateUrl: './forgot-password.component.html',
  styleUrl: '../login/login.component.scss'
})
export class ForgotPasswordComponent {
  private auth = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);
  i18n = inject(I18nService);

  email = '';
  loading = false;
  sent = false;
  error = '';

  async submit() {
    if (!this.email.trim()) return;
    this.loading = true;
    this.error = '';
    const result = await this.auth.forgotPassword(this.email.trim());
    this.loading = false;
    if (result.ok) this.sent = true;
    else this.error = result.error || 'Une erreur est survenue.';
    this.cdr.markForCheck();
  }
}
