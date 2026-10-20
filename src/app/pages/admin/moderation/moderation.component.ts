import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, computed, inject, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { ApiService } from '../../../services/api.service';
import { DialogService } from '../../../services/dialog.service';
import { ToastService } from '../../../services/toast.service';
import { I18nService } from '../../../services/i18n.service';
import { CountryService } from '../../../services/country.service';
import { TranslatePipe } from '../../../pipes/translate.pipe';
import { ImageUrlPipe } from '../../../pipes/image-url.pipe';
import { CityLabelPipe } from '../../../pipes/city-label.pipe';
import { IconComponent } from '../../../components/icon/icon.component';
import { CatIconComponent } from '../../../components/cat-icon/cat-icon.component';
import { FlagIconComponent } from '../../../components/flag-icon/flag-icon.component';
import { ListingCardComponent } from '../../../components/listing-card/listing-card.component';
import { LocalizedRouterLinkDirective } from '../../../directives/localized-router-link.directive';
import { RouterLink } from '@angular/router';
import { CATEGORIES, ListingAttributeValue, ListingStatus, formatPrice, timeAgo } from '../../../models/listing.model';
import { COUNTRIES, countryName } from '../../../models/country.model';
import { formatDateTimeForCountry } from '../../../models/date-format';
import {
  ModerationAction, ModerationActionKey, ModerationDetail, ModerationEvent, ModerationHistory, ModerationQueue, ModerationSignal, ModerationSummary,
} from '../../../models/moderation.model';

type View = 'queue' | 'history';
type ReasonAction = 'reject' | 'request-changes' | 'suspend';

const REASON_MIN = 5;
const REASON_MAX = 1000;

/** Statuses the queue can be filtered by, in the order they are offered. */
const QUEUE_STATUSES: ListingStatus[] = ['PENDING', 'CHANGES_REQUESTED', 'REJECTED', 'SUSPENDED', 'ACTIVE', 'RESERVED', 'SOLD', 'EXPIRED'];

/** Review area for listings ("Anzeigenmoderation"): queue, detail with automatic warnings and seller info, decisions and
 * the history. Every rule is enforced by the server (/api/admin/moderation); this component only mirrors it. */
@Component({
  selector: 'app-moderation',
  imports: [NgClass, FormsModule, RouterLink, LocalizedRouterLinkDirective, TranslatePipe, ImageUrlPipe, CityLabelPipe, IconComponent, CatIconComponent, FlagIconComponent, ListingCardComponent],
  templateUrl: './moderation.component.html',
  styleUrl: './moderation.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModerationComponent implements OnInit, OnChanges {
  private api = inject(ApiService);
  private dialog = inject(DialogService);
  private toast = inject(ToastService);
  private countries = inject(CountryService);
  i18n = inject(I18nService);

  /** Listing the admin dashboard wants to see right away (set from the other tabs). */
  @Input() openId: string | null = null;
  /** Emitted after a decision so the dashboard can refresh its badge. */
  @Output() decided = new EventEmitter<void>();

  readonly categories = CATEGORIES;
  readonly statuses = QUEUE_STATUSES;
  readonly countryList = COUNTRIES;
  readonly reasonMin = REASON_MIN;
  readonly reasonMax = REASON_MAX;

  view = signal<View>('queue');
  summary = signal<ModerationSummary | null>(null);

  // ── queue ──
  queue = signal<ModerationQueue | null>(null);
  queueLoading = signal(false);
  queueError = signal(false);
  filterStatus = 'PENDING';
  filterCountry = '';
  filterCategory = '';
  filterFrom = '';
  filterTo = '';
  filterSearch = '';
  sort = 'oldest';
  page = signal(1);

  // ── history ──
  history = signal<ModerationHistory | null>(null);
  historyLoading = signal(false);
  historyPage = signal(1);
  historyStatus = '';

  // ── detail ──
  detail = signal<ModerationDetail | null>(null);
  detailLoading = signal(false);
  selectedImage = signal(0);
  showPreview = signal(false);
  busy = signal(false);
  /** Open reason form (reject / request changes / suspend) and its input. */
  reasonAction = signal<ReasonAction | null>(null);
  reason = '';
  allowResubmit = false;
  resendingEvent = signal<string | null>(null);

  readonly specAttrs = computed(() => {
    const seen = new Set<string>();
    return [...(this.detail()?.listing.attributeValues ?? [])]
      .filter(av => {
        if (!av.attributeDefinition || seen.has(av.attributeDefinitionId)) return false;
        seen.add(av.attributeDefinitionId);
        return true;
      })
      .sort((a, b) => a.attributeDefinition!.sortOrder - b.attributeDefinition!.sortOrder);
  });

  readonly reasonValid = computed(() => {
    this.reasonTick();
    const len = this.reason.trim().length;
    return len >= REASON_MIN && len <= REASON_MAX;
  });
  /** Re-evaluates reasonValid when the textarea changes (the text itself is a plain ngModel field). */
  private reasonTick = signal(0);

  ngOnInit() {
    this.loadSummary();
    if (this.openId) this.open(this.openId);
    else this.loadQueue();
  }

  ngOnChanges(changes: SimpleChanges) {
    const c = changes['openId'];
    if (c && !c.firstChange && c.currentValue) this.open(c.currentValue as string);
  }

  // ── formatting helpers ──
  countryLabel = (code: string) => countryName(code, this.i18n.lang());
  money = (price: number | null | undefined, currency: string) => (price == null ? '—' : formatPrice(price, currency, this.i18n.lang()));
  ago = (value: string | Date | null | undefined) => (value ? timeAgo(new Date(value), this.i18n.lang()) : '—');
  dateTime = (value: string | Date | null | undefined) => (value ? formatDateTimeForCountry(value, this.countries.country()) : '—');
  category = (value: string) => CATEGORIES.find(c => c.value === value);

  statusLabel(s: string): string {
    const map: Record<string, string> = {
      ACTIVE: 'annonces.active', PENDING: 'annonces.pending', REJECTED: 'annonces.rejected', SOLD: 'annonces.sold',
      RESERVED: 'annonces.reserved', EXPIRED: 'annonces.expired', CHANGES_REQUESTED: 'annonces.changes_requested', SUSPENDED: 'annonces.suspended',
    };
    return map[s] ? this.i18n.t(map[s]) : s;
  }

  statusClass(s: string): string {
    const map: Record<string, string> = {
      ACTIVE: 'badge-active', PENDING: 'badge-pending', RESERVED: 'badge-pending', CHANGES_REQUESTED: 'badge-pending',
      SOLD: 'badge-sold', REJECTED: 'badge-rejected', SUSPENDED: 'badge-rejected', EXPIRED: 'badge-rejected',
    };
    return map[s] ?? '';
  }

  /** Translated text of an automatic warning; falls back to the server's English text for a code this build does not know. */
  signalText(s: ModerationSignal): string {
    const key = 'moderation.sig_' + s.code;
    const params: Record<string, string> = {};
    for (const [k, v] of Object.entries(s.params ?? {})) params[k] = String(v);
    const text = this.i18n.t(key, params);
    return text === key ? s.message : text;
  }

  /** Warnings whose server text carries the actual finding (matched rule, AI categories): shown after the translated label. */
  signalDetail(s: ModerationSignal): string | null {
    return s.code === 'KEYWORD' || s.code === 'AI_FLAGGED' ? s.message : null;
  }

  highestSeverity(signals: ModerationSignal[]): 'high' | 'medium' | 'low' | null {
    if (signals.some(s => s.severity === 'high')) return 'high';
    if (signals.some(s => s.severity === 'medium')) return 'medium';
    return signals.length ? 'low' : null;
  }

  formatAttrValue(av: ListingAttributeValue): string {
    const def = av.attributeDefinition!;
    const all = this.detail()?.listing.attributeValues ?? [];
    if (def.type === 'MULTI_SELECT') return all.filter(x => x.attributeDefinitionId === av.attributeDefinitionId).map(x => this.i18n.t('attrs.opts.' + x.valueText)).join(', ');
    if (def.type === 'SELECT') return this.i18n.t('attrs.opts.' + av.valueText);
    if (def.type === 'BOOLEAN') return this.i18n.t(av.valueBoolean ? 'common.yes' : 'common.no');
    if (def.type === 'NUMBER') return String(av.valueNumber);
    return av.valueText ?? '';
  }

  actorLabel(e: ModerationEvent): string {
    const role = this.i18n.t('moderation.actor_' + e.actorRole);
    return e.actorName && (e.actorRole === 'ADMIN' || e.actorRole === 'MODERATOR') ? `${e.actorName} (${role})` : role;
  }

  eventTitle(e: ModerationEvent): string {
    if (!e.fromStatus) return this.i18n.t('moderation.ev_submitted');
    return this.i18n.t('moderation.ev_changed', { from: this.statusLabel(e.fromStatus), to: this.statusLabel(e.toStatus) });
  }

  isAllowed(action: ModerationActionKey): boolean {
    return !!this.detail()?.allowedActions.includes(action);
  }

  // ── loading ──
  async loadSummary() {
    try {
      this.summary.set(await firstValueFrom(this.api.get<ModerationSummary>('/admin/moderation/summary')));
    } catch { this.summary.set(null); }
  }

  async loadQueue() {
    this.queueLoading.set(true);
    this.queueError.set(false);
    try {
      this.queue.set(await firstValueFrom(this.api.get<ModerationQueue>('/admin/moderation/listings', {
        status: this.filterStatus, country: this.filterCountry, category: this.filterCategory, from: this.filterFrom, to: this.filterTo,
        q: this.filterSearch.trim(), sort: this.sort, page: String(this.page()), limit: '20',
      })));
    } catch {
      this.queue.set(null);
      this.queueError.set(true);
    }
    this.queueLoading.set(false);
  }

  async loadHistory() {
    this.historyLoading.set(true);
    try {
      this.history.set(await firstValueFrom(this.api.get<ModerationHistory>('/admin/moderation/history', { page: String(this.historyPage()), limit: '30', status: this.historyStatus })));
    } catch { this.history.set(null); }
    this.historyLoading.set(false);
  }

  setView(v: View) {
    this.detail.set(null);
    this.view.set(v);
    if (v === 'queue') this.loadQueue(); else this.loadHistory();
  }

  applyFilters() {
    this.page.set(1);
    this.loadQueue();
  }

  resetFilters() {
    this.filterStatus = 'PENDING';
    this.filterCountry = this.filterCategory = this.filterFrom = this.filterTo = this.filterSearch = '';
    this.sort = 'oldest';
    this.applyFilters();
  }

  onStatusFilter() {
    // Waiting listings are worked oldest first; any other view reads newest first.
    this.sort = this.filterStatus === 'PENDING' ? 'oldest' : 'newest';
    this.applyFilters();
  }

  goToPage(p: number) {
    this.page.set(p);
    this.loadQueue();
  }

  goToHistoryPage(p: number) {
    this.historyPage.set(p);
    this.loadHistory();
  }

  applyHistoryFilter() {
    this.historyPage.set(1);
    this.loadHistory();
  }

  // ── detail ──
  async open(id: string) {
    this.detailLoading.set(true);
    this.cancelReason();
    this.showPreview.set(false);
    this.selectedImage.set(0);
    try {
      this.detail.set(await firstValueFrom(this.api.get<ModerationDetail>(`/admin/moderation/listings/${encodeURIComponent(id)}`)));
    } catch {
      this.detail.set(null);
      this.toast.error(this.i18n.t('auth.generic_error'));
    }
    this.detailLoading.set(false);
  }

  async back() {
    this.detail.set(null);
    this.cancelReason();
    if (this.view() === 'queue') await this.loadQueue(); else await this.loadHistory();
  }

  startReason(action: ReasonAction) {
    this.reasonAction.set(action);
    this.reason = '';
    this.allowResubmit = false;
    this.reasonTick.update(n => n + 1);
  }

  cancelReason() {
    this.reasonAction.set(null);
    this.reason = '';
    this.reasonTick.update(n => n + 1);
  }

  onReasonInput() {
    this.reasonTick.update(n => n + 1);
  }

  async approve() {
    const d = this.detail();
    if (!d || this.busy()) return;
    const ok = await this.dialog.confirm({ message: this.i18n.t('moderation.confirm_approve', { title: d.listing.title }), confirmLabel: this.i18n.t('moderation.act_approve') });
    if (ok) await this.decide('approve');
  }

  async requeue() {
    const d = this.detail();
    if (!d || this.busy()) return;
    const ok = await this.dialog.confirm({ message: this.i18n.t('moderation.confirm_requeue'), confirmLabel: this.i18n.t('moderation.act_requeue') });
    if (ok) await this.decide('requeue');
  }

  async submitReason() {
    const action = this.reasonAction();
    if (!action || !this.reasonValid() || this.busy()) return;
    await this.decide(action, this.reason.trim(), action === 'reject' ? this.allowResubmit : undefined);
  }

  /** Sends a decision. `expectedStatus` makes the server refuse it when another reviewer decided in the meantime. */
  private async decide(action: ModerationAction, reason?: string, allowResubmit?: boolean) {
    const d = this.detail();
    if (!d) return;
    this.busy.set(true);
    try {
      const res = await firstValueFrom(this.api.post<{ ok: true; status: string; event: { emailStatus: string | null } | null }>(
        `/admin/moderation/listings/${d.listing.id}/${action}`,
        { reason, allowResubmit, expectedStatus: d.listing.status },
      ));
      this.toast.success(this.i18n.t('moderation.done_' + action.replace('-', '_')));
      if (res.event?.emailStatus === 'FAILED') this.toast.info(this.i18n.t('moderation.mail_failed_note'));
      this.cancelReason();
      this.decided.emit();
      this.loadSummary();
      await this.open(d.listing.id);
    } catch (e) {
      const err = e as HttpErrorResponse;
      const code = err.error?.code as string | undefined;
      if (err.status === 409) {
        this.toast.error(this.i18n.t('moderation.conflict'));
        this.cancelReason();
        await this.open(d.listing.id);
        this.loadSummary();
      } else if (code === 'REASON_REQUIRED' || code === 'REASON_TOO_SHORT' || code === 'REASON_TOO_LONG') {
        this.toast.error(this.i18n.t('moderation.reason_required'));
      } else {
        this.toast.error(this.i18n.t('auth.generic_error'));
      }
    }
    this.busy.set(false);
  }

  async resendMail(e: ModerationEvent) {
    if (this.resendingEvent()) return;
    this.resendingEvent.set(e.id);
    try {
      const res = await firstValueFrom(this.api.post<{ ok: boolean }>(`/admin/moderation/events/${e.id}/resend-email`, {}));
      if (res.ok) this.toast.success(this.i18n.t('moderation.mail_resent_ok')); else this.toast.error(this.i18n.t('moderation.mail_resent_fail'));
    } catch (err) {
      this.toast.error(this.i18n.t((err as HttpErrorResponse).status === 409 ? 'moderation.mail_not_retryable' : 'auth.generic_error'));
    }
    this.resendingEvent.set(null);
    const d = this.detail();
    if (d) await this.open(d.listing.id);
  }
}
