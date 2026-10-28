import { ChangeDetectorRef, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { LocalizedRouterLinkDirective } from '../../directives/localized-router-link.directive';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { CookieConsentService } from '../../services/cookie-consent.service';
import { I18nService } from '../../services/i18n.service';
import { ToastService } from '../../services/toast.service';
import { UserService } from '../../services/user.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

type EmailPrefKey = 'emailMessages' | 'emailSavedSearches' | 'emailListingReminders';
type EmailPrefs = Record<EmailPrefKey, boolean>;

interface BlockedUser { id: string; name: string; image: string | null; blockedAt: string }

/** Account self-service for personal data: which e-mails to receive, the list of blocked users (to unblock),
 * the download of everything stored about the account (GDPR Art. 15 / 20) and the cookie settings. */
@Component({
  selector: 'app-mes-donnees',
  imports: [CommonModule, RouterLink, LocalizedRouterLinkDirective, TranslatePipe],
  templateUrl: './mes-donnees.component.html',
  styleUrl: './mes-donnees.component.scss'
})
export class MesDonneesComponent implements OnInit {
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private i18n = inject(I18nService);
  private router = inject(Router);
  private toast = inject(ToastService);
  private users = inject(UserService);
  private cdr = inject(ChangeDetectorRef);
  cookieConsent = inject(CookieConsentService);

  readonly emailRows: { key: EmailPrefKey; label: string }[] = [
    { key: 'emailMessages', label: 'mes_donnees.email_messages' },
    { key: 'emailSavedSearches', label: 'mes_donnees.email_saved_searches' },
    { key: 'emailListingReminders', label: 'mes_donnees.email_listing_reminders' },
  ];

  prefs = signal<EmailPrefs | null>(null);
  blocked = signal<BlockedUser[] | null>(null);
  exporting = signal(false);

  ngOnInit() {
    if (!this.auth.isLoggedIn) { this.router.navigate(this.i18n.withLang(['/auth/login'])); return; }
    void this.load();
  }

  private async load() {
    try { this.prefs.set(await firstValueFrom(this.api.get<EmailPrefs>('/auth/email-preferences'))); } catch { this.prefs.set(null); }
    try { this.blocked.set(await firstValueFrom(this.api.get<BlockedUser[]>('/users/me/blocked'))); } catch { this.blocked.set([]); }
    this.cdr.markForCheck();
  }

  /** Saves right away, like a settings switch on a phone; the switch goes back if the server refuses. */
  async toggle(key: EmailPrefKey) {
    const current = this.prefs();
    if (!current) return;
    const next = { ...current, [key]: !current[key] };
    this.prefs.set(next);
    try {
      this.prefs.set(await firstValueFrom(this.api.put<EmailPrefs>('/auth/email-preferences', { [key]: next[key] })));
      this.toast.success(this.i18n.t('mes_donnees.saved'));
    } catch {
      this.prefs.set(current);
      this.toast.error(this.i18n.t('common.error'));
    }
  }

  async unblock(user: BlockedUser) {
    try {
      await firstValueFrom(this.users.unblockUser(user.id));
      this.blocked.update(list => (list ?? []).filter(u => u.id !== user.id));
      this.toast.success(this.i18n.t('mes_donnees.saved'));
    } catch {
      this.toast.error(this.i18n.t('common.error'));
    }
  }

  async download() {
    this.exporting.set(true);
    try {
      const data = await firstValueFrom(this.api.get<unknown>('/auth/export'));
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'souqmar24-my-data.json';
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      this.toast.error(this.i18n.t('mes_donnees.export_error'));
    }
    this.exporting.set(false);
  }
}
