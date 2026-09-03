import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { I18nService } from '../../../services/i18n.service';
import { TranslatePipe } from '../../../pipes/translate.pipe';

@Component({
  selector: 'app-reset-password',
  imports: [CommonModule, RouterLink, FormsModule, TranslatePipe],
  templateUrl: './reset-password.component.html',
  styleUrl: '../login/login.component.scss'
})
export class ResetPasswordComponent implements OnInit {
  private auth = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  i18n = inject(I18nService);

  token = '';
  password = '';
  confirmPassword = '';
  showPass = false;
  loading = false;
  success = false;
  error = '';
  missingToken = false;

  ngOnInit() {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
    if (!this.token) this.missingToken = true;
  }

  async submit() {
    if (this.password.length < 6) { this.error = this.i18n.t('auth.reset_too_short'); return; }
    if (this.password !== this.confirmPassword) { this.error = this.i18n.t('auth.reset_mismatch'); return; }
    this.loading = true;
    this.error = '';
    const result = await this.auth.resetPassword(this.token, this.password);
    this.loading = false;
    if (result.ok) {
      this.success = true;
      setTimeout(() => this.router.navigate(['/auth/login']), 2500);
    } else {
      this.error = result.error || 'Une erreur est survenue.';
    }
    this.cdr.markForCheck();
  }
}
