import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { I18nService } from '../../services/i18n.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { PasswordInputComponent } from '../../components/password-input/password-input.component';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-supprimer-compte',
  imports: [CommonModule, FormsModule, RouterLink, TranslatePipe, PasswordInputComponent],
  templateUrl: './supprimer-compte.component.html',
  styleUrl: './supprimer-compte.component.scss'
})
export class SupprimerCompteComponent implements OnInit {
  password = '';
  confirmed = false;
  deleting = signal(false);
  done = signal(false);
  errorMsg = '';

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private i18n: I18nService,
    private router: Router
  ) {}

  ngOnInit() {
    if (!this.auth.isLoggedIn) { this.router.navigate(['/auth/login']); return; }
  }

  async deleteAccount() {
    this.errorMsg = '';
    if (!this.password) { this.errorMsg = this.i18n.t('delete_account.password_label'); return; }
    if (!this.confirmed) { this.errorMsg = this.i18n.t('delete_account.confirm_checkbox'); return; }

    this.deleting.set(true);
    try {
      await firstValueFrom(this.api.delete('/auth/account', { password: this.password }));
      this.done.set(true);
      setTimeout(() => this.auth.logout(), 2000);
    } catch (e) {
      const err = e as { error?: { error?: string } };
      this.errorMsg = err?.error?.error || this.i18n.t('delete_account.error_generic');
    } finally {
      this.deleting.set(false);
    }
  }
}
