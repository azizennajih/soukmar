import { ChangeDetectorRef, Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { DialogService } from '../../services/dialog.service';
import { I18nService } from '../../services/i18n.service';
import { ToastService } from '../../services/toast.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

const LANGS = ['de', 'en', 'fr', 'es', 'it', 'pt', 'tr', 'ar', 'fa', 'ur', 'ps'] as const;
type CampaignStatus = 'DRAFT' | 'SENDING' | 'SENT' | 'CANCELLED';

interface Content { subject: string; body: string; ctaLabel: string; ctaUrl: string }

interface CampaignSummary {
  id: string; name: string; status: CampaignStatus;
  recipientCount: number; sentCount: number; failedCount: number; createdAt: string;
}

interface Editing {
  id: string | null;
  status: CampaignStatus;
  name: string;
  contents: Record<string, Content>;
  countries: string;
  langs: string[];
  accountType: '' | 'PRIVATE' | 'BUSINESS';
  recipientCount: number;
  sentCount: number;
  failedCount: number;
}

const emptyContent = (): Content => ({ subject: '', body: '', ctaLabel: '', ctaUrl: '' });

/** Admin area for advertising e-mails: write a campaign per language, pick who it reaches (only users who opted in —
 * the server enforces that, no filter here can widen it), send a test to yourself, then send. */
@Component({
  selector: 'app-admin-campaigns',
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './admin-campaigns.component.html',
  styleUrl: './admin-campaigns.component.scss'
})
export class AdminCampaignsComponent implements OnInit, OnDestroy {
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private dialog = inject(DialogService);
  private i18n = inject(I18nService);
  private toast = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);

  readonly langs = LANGS;
  readonly accountTypes: Editing['accountType'][] = ['', 'PRIVATE', 'BUSINESS'];

  campaigns = signal<CampaignSummary[] | null>(null);
  editing = signal<Editing | null>(null);
  activeLang = signal<string>('de');
  audienceCount = signal<number | null>(null);
  busy = signal(false);
  errorText = signal('');

  private countTimer?: ReturnType<typeof setTimeout>;
  private pollTimer?: ReturnType<typeof setInterval>;

  ngOnInit() { void this.loadList(); }

  ngOnDestroy() {
    clearTimeout(this.countTimer);
    clearInterval(this.pollTimer);
  }

  get isDraft(): boolean { return this.editing()?.status === 'DRAFT'; }
  get userEmail(): string { return this.auth.currentUser()?.email ?? ''; }

  hasContent(lang: string): boolean {
    const c = this.editing()?.contents[lang];
    return !!c && (!!c.subject.trim() || !!c.body.trim());
  }

  private async loadList() {
    try { this.campaigns.set(await firstValueFrom(this.api.get<CampaignSummary[]>('/admin/campaigns'))); }
    catch { this.campaigns.set([]); }
    this.cdr.markForCheck();
  }

  newCampaign() {
    this.errorText.set('');
    this.activeLang.set(this.i18n.lang() in { de: 1, en: 1, fr: 1, es: 1, it: 1, pt: 1, tr: 1, ar: 1, fa: 1, ur: 1, ps: 1 } ? this.i18n.lang() : 'de');
    this.editing.set({
      id: null, status: 'DRAFT', name: '',
      contents: Object.fromEntries(LANGS.map(l => [l, emptyContent()])),
      countries: '', langs: [], accountType: '', recipientCount: 0, sentCount: 0, failedCount: 0,
    });
    this.scheduleCount(0);
  }

  async open(id: string) {
    this.errorText.set('');
    try {
      const c = await firstValueFrom(this.api.get<any>(`/admin/campaigns/${id}`));
      this.setFromServer(c);
      const firstWithText = LANGS.find(l => c.contents?.[l]) ?? 'de';
      this.activeLang.set(firstWithText);
      this.scheduleCount(0);
      this.startPolling();
    } catch { this.toast.error(this.i18n.t('campaigns.error')); }
  }

  private setFromServer(c: any) {
    const contents: Record<string, Content> = Object.fromEntries(LANGS.map(l => [l, emptyContent()]));
    for (const [lang, v] of Object.entries(c.contents ?? {}) as [string, any][]) {
      contents[lang] = { subject: v.subject ?? '', body: v.body ?? '', ctaLabel: v.ctaLabel ?? '', ctaUrl: v.ctaUrl ?? '' };
    }
    this.editing.set({
      id: c.id, status: c.status, name: c.name, contents,
      countries: (c.audience?.countries ?? []).join(', '),
      langs: c.audience?.langs ?? [],
      accountType: c.audience?.accountType ?? '',
      recipientCount: c.recipientCount, sentCount: c.sentCount, failedCount: c.failedCount,
    });
    this.cdr.markForCheck();
  }

  /** A running send updates its counters; refresh them until it is over. */
  private startPolling() {
    clearInterval(this.pollTimer);
    this.pollTimer = setInterval(async () => {
      const e = this.editing();
      if (!e?.id || e.status !== 'SENDING') { clearInterval(this.pollTimer); return; }
      try {
        const c = await firstValueFrom(this.api.get<any>(`/admin/campaigns/${e.id}`));
        this.editing.update(cur => cur ? { ...cur, status: c.status, recipientCount: c.recipientCount, sentCount: c.sentCount, failedCount: c.failedCount } : cur);
        this.cdr.markForCheck();
      } catch { /* try again on the next tick */ }
    }, 3000);
  }

  back() {
    clearInterval(this.pollTimer);
    clearTimeout(this.countTimer);
    this.editing.set(null);
    void this.loadList();
  }

  // ── audience ───────────────────────────────────────────────────────────────

  private audiencePayload() {
    const e = this.editing()!;
    const countries = e.countries.split(/[\s,;]+/).map(c => c.trim().toUpperCase()).filter(c => /^[A-Z]{2}$/.test(c));
    return { countries, langs: e.langs, accountType: e.accountType };
  }

  toggleLang(lang: string) {
    this.editing.update(e => e ? { ...e, langs: e.langs.includes(lang) ? e.langs.filter(l => l !== lang) : [...e.langs, lang] } : e);
    this.scheduleCount();
  }

  scheduleCount(delay = 400) {
    clearTimeout(this.countTimer);
    this.countTimer = setTimeout(() => void this.refreshCount(), delay);
  }

  private async refreshCount() {
    if (!this.editing()) return;
    try {
      const r = await firstValueFrom(this.api.post<{ count: number }>('/admin/campaigns/audience-count', { audience: this.audiencePayload() }));
      this.audienceCount.set(r.count);
    } catch { this.audienceCount.set(null); }
    this.cdr.markForCheck();
  }

  // ── actions ────────────────────────────────────────────────────────────────

  private payload() {
    const e = this.editing()!;
    const contents: Record<string, unknown> = {};
    for (const [lang, c] of Object.entries(e.contents)) {
      if (!c.subject.trim() && !c.body.trim()) continue;
      contents[lang] = { subject: c.subject, body: c.body, ...(c.ctaLabel.trim() || c.ctaUrl.trim() ? { ctaLabel: c.ctaLabel, ctaUrl: c.ctaUrl } : {}) };
    }
    return { name: e.name, contents, audience: this.audiencePayload() };
  }

  private showError(e: unknown, fallbackKey = 'campaigns.error') {
    const err = (e as { error?: { error?: string; detail?: string } })?.error;
    this.errorText.set(err?.detail ? `${err.error ?? this.i18n.t(fallbackKey)} (${err.detail})` : (err?.error ?? this.i18n.t(fallbackKey)));
    this.cdr.markForCheck();
  }

  /** Saves the draft (creating it the first time) and returns its id, or null if the server refused. */
  async save(): Promise<string | null> {
    const e = this.editing();
    if (!e || !this.isDraft) return e?.id ?? null;
    this.errorText.set('');
    if (!Object.keys(this.payload().contents).length) { this.errorText.set(this.i18n.t('campaigns.no_text')); return null; }
    this.busy.set(true);
    try {
      const saved = e.id
        ? await firstValueFrom(this.api.put<any>(`/admin/campaigns/${e.id}`, this.payload()))
        : await firstValueFrom(this.api.post<any>('/admin/campaigns', this.payload()));
      this.editing.update(cur => cur ? { ...cur, id: saved.id } : cur);
      this.toast.success(this.i18n.t('mes_donnees.saved'));
      return saved.id as string;
    } catch (err) {
      this.showError(err);
      return null;
    } finally { this.busy.set(false); }
  }

  async sendTest() {
    const id = await this.save();
    if (!id) return;
    this.busy.set(true);
    try {
      const r = await firstValueFrom(this.api.post<{ sentTo: string }>(`/admin/campaigns/${id}/test`, { lang: this.activeLang() }));
      this.toast.success(this.i18n.t('campaigns.test_sent', { email: r.sentTo }));
    } catch (err) { this.showError(err); }
    this.busy.set(false);
  }

  async send() {
    const id = await this.save();
    if (!id) return;
    // the number the admin sees and confirms is the number the server must still have at the moment of sending
    await this.refreshCount();
    const count = this.audienceCount();
    if (!count) { this.errorText.set(this.i18n.t('campaigns.recipients', { count: '0' })); return; }
    const ok = await this.dialog.confirm({ message: this.i18n.t('campaigns.send_confirm', { count: String(count) }), danger: true });
    if (!ok) return;
    this.busy.set(true);
    try {
      const c = await firstValueFrom(this.api.post<any>(`/admin/campaigns/${id}/send`, { confirmCount: count }));
      this.editing.update(cur => cur ? { ...cur, status: c.status, recipientCount: c.recipientCount, sentCount: c.sentCount, failedCount: c.failedCount } : cur);
      this.startPolling();
    } catch (err) {
      const e = (err as { status?: number; error?: { count?: number } });
      if (e.status === 409 && typeof e.error?.count === 'number') {
        this.audienceCount.set(e.error.count);
        this.errorText.set(this.i18n.t('campaigns.audience_changed', { count: String(e.error.count) }));
      } else { this.showError(err); }
    }
    this.busy.set(false);
  }

  async cancelSend() {
    const id = this.editing()?.id;
    if (!id) return;
    try {
      await firstValueFrom(this.api.post(`/admin/campaigns/${id}/cancel`, {}));
      this.editing.update(cur => cur ? { ...cur, status: 'CANCELLED' } : cur);
    } catch (err) { this.showError(err); }
  }

  async remove() {
    const e = this.editing();
    if (!e?.id) { this.back(); return; }
    const ok = await this.dialog.confirm({ message: this.i18n.t('campaigns.delete_confirm', { name: e.name }), danger: true });
    if (!ok) return;
    try {
      await firstValueFrom(this.api.delete(`/admin/campaigns/${e.id}`));
      this.back();
    } catch (err) { this.showError(err); }
  }

  statusLabel(status: string): string { return this.i18n.t(`campaigns.status_${status}`); }
  countsLabel(c: { sentCount: number; recipientCount: number; failedCount: number }): string {
    return this.i18n.t('campaigns.counts', { sent: String(c.sentCount), total: String(c.recipientCount), failed: String(c.failedCount) });
  }
}
