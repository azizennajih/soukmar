import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { I18nService } from '../../../services/i18n.service';
import { TranslatePipe } from '../../../pipes/translate.pipe';

@Component({
  selector: 'app-login',
  imports: [CommonModule, RouterLink, FormsModule, TranslatePipe],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  i18n = inject(I18nService);

  email = '';
  password = '';
  showPass = false;
  loading = false;
  error = '';
  unverifiedEmail = '';
  verifiedSuccess = false;
  resendLoading = false;
  resendOk = false;

  ngOnInit() {
    this.route.queryParams.subscribe(p => {
      if (p['verified'] === '1') this.verifiedSuccess = true;
    });
  }

  async submit() {
    if (!this.email || !this.password) { this.error = 'Veuillez remplir tous les champs.'; return; }
    this.loading = true;
    this.error = '';
    this.unverifiedEmail = '';
    try {
      const result = await this.auth.login(this.email, this.password);
      if (result.ok) {
        this.router.navigate(['/']);
      } else if (result.unverified) {
        this.unverifiedEmail = this.email;
        this.error = result.error || this.i18n.t('auth.unverified_error');
      } else {
        this.error = result.error || 'Email ou mot de passe incorrect.';
      }
    } catch {
      this.error = 'Une erreur inattendue est survenue.';
    } finally {
      this.loading = false;
    }
  }

  async resend() {
    if (this.resendLoading || !this.unverifiedEmail) return;
    this.resendLoading = true;
    this.resendOk = false;
    const result = await this.auth.resendVerification(this.unverifiedEmail);
    this.resendLoading = false;
    if (result.ok) this.resendOk = true;
  }
}
