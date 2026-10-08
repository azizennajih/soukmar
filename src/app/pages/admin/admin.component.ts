import { Component, OnInit, OnDestroy, signal, computed, inject, effect, untracked, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LocalizedRouterLinkDirective } from '../../directives/localized-router-link.directive';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { ListingService } from '../../services/listing.service';
import { AuthService } from '../../services/auth.service';
import { I18nService } from '../../services/i18n.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { CityLabelPipe } from '../../pipes/city-label.pipe';
import { CatIconComponent } from '../../components/cat-icon/cat-icon.component';
import { IconComponent } from '../../components/icon/icon.component';
import { Listing, CATEGORIES, formatPrice, timeAgo } from '../../models/listing.model';
import { Report } from '../../models/report.model';
import { ReportService } from '../../services/report.service';
import { BoostTierId } from '../../models/boost.model';
import { countryName, currencyForCountry } from '../../models/country.model';
import { formatDateTimeForCountry, formatDateForCountry } from '../../models/date-format';
import { CountryService } from '../../services/country.service';
import { FlagIconComponent } from '../../components/flag-icon/flag-icon.component';
import { firstValueFrom } from 'rxjs';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN' | 'MODERATOR';
  city?: string;
  country?: string;
  phone?: string;
  createdAt: Date;
  _count?: { listings: number };
  banned?: boolean;
}

type Tab = 'overview' | 'listings' | 'users' | 'revenue' | 'visitors' | 'reports' | 'security' | 'id-verifications' | 'boost-requests';

export interface AdminActivity {
  type: 'USER' | 'LISTING' | 'BOOST_REQUEST' | 'REVENUE' | 'REPORT' | 'ID_VERIFICATION';
  at: string;
  country: string | null;
  title: string;
  detail?: string;
  amount?: number;
  currency?: string;
  status?: string;
}

export interface AdminAnalytics {
  days: number;
  activeNow: { total: number; byCountry: { country: string; count: number }[] };
  today: { total: number; byCountry: { country: string; visitors: number }[] };
  daily: { date: string; visitors: number }[];
  byCountry: { country: string; visitors: number }[];
}

export interface AdminIdVerification {
  id: string;
  userId: string;
  idImageUrl: string;
  selfieImageUrl: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  adminNote: string | null;
  createdAt: Date;
  reviewedAt: Date | null;
  user: { id: string; name: string; email: string };
}

export interface AdminBoostRequest {
  id: string;
  listingId: string;
  userId: string;
  tiers: BoostTierId[];
  totalPrice: number;
  currency: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  adminNote: string | null;
  createdAt: Date;
  resolvedAt: Date | null;
  user: { id: string; name: string; email: string };
  listing: { id: string; title: string; images: string[]; status: string };
}
type ListingFilter = 'ALL' | 'ACTIVE' | 'PENDING' | 'REJECTED' | 'SOLD' | 'RESERVED';

export interface SecurityEvent {
  id: string;
  type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  ip: string | null;
  userId: string | null;
  detail: string | null;
  createdAt: Date;
  user: { id: string; name: string; email: string } | null;
}

@Component({
  selector: 'app-admin',
  imports: [CommonModule, RouterLink, LocalizedRouterLinkDirective, FormsModule, CatIconComponent, IconComponent, TranslatePipe, CityLabelPipe, FlagIconComponent],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export class AdminComponent implements OnInit, OnDestroy {
  private api = inject(ApiService);
  private ls = inject(ListingService);
  private reportService = inject(ReportService);
  public auth = inject(AuthService);
  public i18n = inject(I18nService);
  private cdr = inject(ChangeDetectorRef);
  public countryService = inject(CountryService);
  countryName = countryName;

  /** What the dashboard covers: the country chosen in the footer, or every country at once. */
  scope = signal<'country' | 'all'>('country');
  activity: AdminActivity[] = [];
  analytics: AdminAnalytics | null = null;
  analyticsLoading = signal(false);
  private analyticsTimer?: ReturnType<typeof setInterval>;

  constructor() {
    // The dashboard follows the chosen scope: users, listings, stats, revenue and the activity feed.
    effect(() => {
      this.countryService.country();
      this.scope();
      untracked(() => { this.loadListings(); this.loadUsers(); this.loadActivity(); this.loadAnalytics(); });
    });
  }

  /** Country the dashboard data is limited to; undefined while showing all countries. */
  private get scopeCountry(): string | undefined {
    return this.scope() === 'all' ? undefined : this.countryService.country();
  }

  setScope(s: 'country' | 'all') { this.scope.set(s); }

  /** Date and time of an event in the browsing country's own format. */
  dateTime(value: string | Date | null | undefined): string {
    return value ? formatDateTimeForCountry(value, this.countryService.country()) : '';
  }

  /** Just the day, in the browsing country's format (own table column, never cut off). */
  dateOnly(value: string | Date | null | undefined): string {
    return value ? formatDateForCountry(value, this.countryService.country()) : '—';
  }

  /** Just the time of day (24 h). */
  timeOnly(value: string | Date | null | undefined): string {
    if (!value) return '';
    const d = new Date(value);
    if (isNaN(d.getTime())) return '';
    return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
  }

  private async loadActivity() {
    try {
      const params: Record<string, string> = { limit: '40' };
      const c = this.scopeCountry;
      if (c) params['country'] = c;
      this.activity = await firstValueFrom(this.api.get<AdminActivity[]>('/admin/activity', params));
    } catch { this.activity = []; }
    this.cdr.markForCheck();
  }

  async loadAnalytics() {
    this.analyticsLoading.set(true);
    try {
      const params: Record<string, string> = { days: '30' };
      const c = this.scopeCountry;
      if (c) params['country'] = c;
      this.analytics = await firstValueFrom(this.api.get<AdminAnalytics>('/admin/analytics', params));
    } catch { this.analytics = null; }
    this.analyticsLoading.set(false);
    this.cdr.markForCheck();
  }

  /** Tallest bar of the daily visitor chart, so the others scale against it. */
  get visitorsMax(): number {
    return Math.max(...(this.analytics?.daily.map(d => d.visitors) ?? [0]), 1);
  }

  get visitorsByCountryMax(): number {
    return Math.max(...(this.analytics?.byCountry.map(c => c.visitors) ?? [0]), 1);
  }

  get activeByCountryMax(): number {
    return Math.max(...(this.analytics?.activeNow.byCountry.map(c => c.count) ?? [0]), 1);
  }

  countryLabel(code: string): string {
    return code === 'ZZ' ? this.i18n.t('admin.unknown_country') : countryName(code, this.i18n.lang());
  }

  shortDay(iso: string): string {
    return iso.slice(8) + '.' + iso.slice(5, 7);
  }

  ngOnDestroy() {
    clearInterval(this.analyticsTimer);
  }

  tab = signal<Tab>('overview');
  loading = signal(true);
  usersLoading = signal(false);

  allListings: Listing[] = [];
  users: AdminUser[] = [];
  reports: Report[] = [];
  reportsLoading = signal(false);
  reportFilter = signal<'ALL' | 'PENDING' | 'RESOLVED' | 'DISMISSED'>('PENDING');

  securityEvents: SecurityEvent[] = [];
  securityLoading = signal(false);
  securitySeverityFilter = signal<'ALL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL');
  listingFilter = signal<ListingFilter>('ALL');
  userSearch = '';

  idVerifications: AdminIdVerification[] = [];
  idVerificationsLoading = signal(false);
  idVerificationFilter = signal<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');

  boostRequests: AdminBoostRequest[] = [];
  boostRequestsLoading = signal(false);
  boostRequestFilter = signal<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');

  actionLoading = new Set<string>();

  readonly CATEGORIES = CATEGORIES;
  readonly filterOptions: ListingFilter[] = ['ALL','ACTIVE','PENDING','REJECTED','SOLD','RESERVED'];

  get monthLabels(): string[] {
    const lang = this.i18n.lang();
    const locale = lang === 'ar' ? 'ar-MA' : lang === 'en' ? 'en-US' : lang;
    const fmt = new Intl.DateTimeFormat(locale, { month: 'short' });
    return Array.from({ length: 12 }, (_, m) => fmt.format(new Date(2000, m, 1)));
  }

  get filteredListings(): Listing[] {
    const f = this.listingFilter();
    return f === 'ALL' ? this.allListings : this.allListings.filter(l => l.status === f);
  }

  get filteredUsers(): AdminUser[] {
    const q = this.userSearch.toLowerCase();
    return q ? this.users.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)) : this.users;
  }

  get filteredReports(): Report[] {
    const f = this.reportFilter();
    return f === 'ALL' ? this.reports : this.reports.filter(r => r.status === f);
  }

  get pendingReportsCount(): number {
    return this.reports.filter(r => r.status === 'PENDING').length;
  }

  get filteredIdVerifications(): AdminIdVerification[] {
    const f = this.idVerificationFilter();
    return f === 'ALL' ? this.idVerifications : this.idVerifications.filter(v => v.status === f);
  }

  get pendingIdVerificationsCount(): number {
    return this.idVerifications.filter(v => v.status === 'PENDING').length;
  }

  get filteredBoostRequests(): AdminBoostRequest[] {
    const f = this.boostRequestFilter();
    return f === 'ALL' ? this.boostRequests : this.boostRequests.filter(r => r.status === f);
  }

  get pendingBoostRequestsCount(): number {
    return this.boostRequests.filter(r => r.status === 'PENDING').length;
  }

  get filteredSecurityEvents(): SecurityEvent[] {
    const f = this.securitySeverityFilter();
    return f === 'ALL' ? this.securityEvents : this.securityEvents.filter(e => e.severity === f);
  }

  get highSeverityEventCount(): number {
    return this.securityEvents.filter(e => e.severity === 'HIGH').length;
  }

  get stats() {
    const total = this.allListings.length;
    const active = this.allListings.filter(l => l.status === 'ACTIVE').length;
    const pending = this.allListings.filter(l => l.status === 'PENDING').length;
    const premium = this.allListings.filter(l => l.isPremium).length;
    const premiumRevenue = premium * 99;
    return { total, active, pending, premium, premiumRevenue, users: this.users.length };
  }

  get categoryStats() {
    const counts: Record<string, number> = {};
    this.allListings.forEach(l => { counts[l.category] = (counts[l.category] || 0) + 1; });
    return CATEGORIES.map(c => ({
      ...c,
      count: counts[c.value] || 0,
      pct: this.allListings.length ? Math.round(((counts[c.value] || 0) / this.allListings.length) * 100) : 0
    })).sort((a, b) => b.count - a.count);
  }

  get monthlyData(): number[] {
    const counts = new Array(12).fill(0);
    this.allListings.forEach(l => {
      const m = new Date(l.createdAt).getMonth();
      counts[m]++;
    });
    return counts;
  }

  get monthlyMax(): number {
    return Math.max(...this.monthlyData, 1);
  }

  get revenueMonthly(): number[] {
    const counts = new Array(12).fill(0);
    this.allListings.filter(l => l.isPremium).forEach(l => {
      const m = new Date(l.createdAt).getMonth();
      counts[m] += 99;
    });
    return counts;
  }

  get revenueMax(): number {
    return Math.max(...this.revenueMonthly, 1);
  }

  /** Currency of the country the dashboard is showing. */
  get revenueCurrency(): string { return this.scope() === 'all' ? 'EUR' : currencyForCountry(this.countryService.country()); }
  formatPrice = (p: number, currency = this.revenueCurrency) => formatPrice(p, currency, this.i18n.lang());
  timeAgo = (d: Date) => timeAgo(d, this.i18n.lang());

  ngOnInit() {
    this.loadReports();
    this.loadSecurityEvents();
    this.loadIdVerifications();
    this.loadBoostRequests();
  }

  private async loadIdVerifications() {
    this.idVerificationsLoading.set(true);
    try {
      this.idVerifications = await firstValueFrom(this.api.get<AdminIdVerification[]>('/admin/id-verifications'));
    } catch { this.idVerifications = []; }
    this.idVerificationsLoading.set(false);
    this.cdr.markForCheck();
  }

  private async loadBoostRequests() {
    this.boostRequestsLoading.set(true);
    try {
      this.boostRequests = await firstValueFrom(this.api.get<AdminBoostRequest[]>('/admin/boost-requests'));
    } catch { this.boostRequests = []; }
    this.boostRequestsLoading.set(false);
    this.cdr.markForCheck();
  }

  async reviewBoostRequest(r: AdminBoostRequest, status: 'APPROVED' | 'REJECTED') {
    if (this.actionLoading.has(r.id)) return;
    this.actionLoading.add(r.id);
    try {
      const note = status === 'REJECTED' ? (prompt(this.i18n.t('admin.boost_request_note_prompt')) ?? undefined) : undefined;
      const updated = await firstValueFrom(this.api.patch<AdminBoostRequest>(`/admin/boost-requests/${r.id}`, { status, adminNote: note }));
      r.status = updated.status;
      r.adminNote = updated.adminNote;
      r.resolvedAt = updated.resolvedAt;
    } catch { alert(this.i18n.t('auth.generic_error')); }
    this.actionLoading.delete(r.id);
    this.cdr.markForCheck();
  }

  async reviewIdVerification(v: AdminIdVerification, status: 'APPROVED' | 'REJECTED') {
    if (this.actionLoading.has(v.id)) return;
    this.actionLoading.add(v.id);
    try {
      const note = status === 'REJECTED' ? (prompt(this.i18n.t('admin.id_verification_note_prompt')) ?? undefined) : undefined;
      const updated = await firstValueFrom(this.api.patch<AdminIdVerification>(`/admin/id-verifications/${v.id}`, { status, adminNote: note }));
      v.status = updated.status;
      v.adminNote = updated.adminNote;
      v.reviewedAt = updated.reviewedAt;
    } catch { alert(this.i18n.t('auth.generic_error')); }
    this.actionLoading.delete(v.id);
    this.cdr.markForCheck();
  }

  private async loadSecurityEvents() {
    this.securityLoading.set(true);
    try {
      this.securityEvents = await firstValueFrom(this.api.get<SecurityEvent[]>('/admin/security-events'));
    } catch { this.securityEvents = []; }
    this.securityLoading.set(false);
    this.cdr.markForCheck();
  }

  private async loadReports() {
    this.reportsLoading.set(true);
    try {
      this.reports = await firstValueFrom(this.reportService.adminList());
    } catch { this.reports = []; }
    this.reportsLoading.set(false);
    this.cdr.markForCheck();
  }

  async resolveReport(report: Report, status: 'RESOLVED' | 'DISMISSED') {
    if (this.actionLoading.has(report.id)) return;
    this.actionLoading.add(report.id);
    try {
      const note = prompt(this.i18n.t('admin.reports_note_prompt')) ?? undefined;
      const updated = await firstValueFrom(this.reportService.adminUpdate(report.id, { status, adminNote: note }));
      report.status = updated.status;
      report.adminNote = updated.adminNote;
      report.resolvedAt = updated.resolvedAt;
    } catch { alert(this.i18n.t('auth.generic_error')); }
    this.actionLoading.delete(report.id);
    this.cdr.markForCheck();
  }

  private async loadListings() {
    this.loading.set(true);
    try {
      const res = await firstValueFrom(this.api.get<any>('/listings', { limit: '500', status: 'ALL', country: this.scopeCountry ?? '' }));
      this.allListings = res.listings ?? res;
    } catch { this.allListings = []; }
    this.loading.set(false);
    this.cdr.markForCheck();
  }

  private async loadUsers() {
    this.usersLoading.set(true);
    try {
      const res = await firstValueFrom(this.api.get<AdminUser[]>('/admin/users', { country: this.scopeCountry ?? '' }));
      this.users = res;
    } catch {
      // fallback: extract unique users from listings
      const map = new Map<string, AdminUser>();
      this.allListings.forEach(l => {
        if (l.user && !map.has(l.userId)) {
          map.set(l.userId, {
            id: l.userId,
            name: l.user.name,
            email: l.user.email ?? '—',
            role: 'USER',
            city: l.user.city,
            createdAt: l.user.createdAt,
            _count: { listings: 0 }
          });
        }
        if (map.has(l.userId)) map.get(l.userId)!._count!.listings++;
      });
      this.users = Array.from(map.values());
    }
    this.usersLoading.set(false);
    this.cdr.markForCheck();
  }

  setTab(t: Tab) {
    this.tab.set(t);
    // The visitors tab refreshes by itself while it is open ("active now" changes by the minute).
    clearInterval(this.analyticsTimer);
    if (t === 'visitors') {
      this.loadAnalytics();
      this.analyticsTimer = setInterval(() => this.loadAnalytics(), 30_000);
    }
  }
  setListingFilter(f: ListingFilter) { this.listingFilter.set(f); }
  setReportFilter(f: 'ALL' | 'PENDING' | 'RESOLVED' | 'DISMISSED') { this.reportFilter.set(f); }
  setIdVerificationFilter(f: 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED') { this.idVerificationFilter.set(f); }
  setBoostRequestFilter(f: 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED') { this.boostRequestFilter.set(f); }

  boostTierLabel(id: BoostTierId): string {
    return this.i18n.t('boost.tier_' + id + '_name');
  }
  setSecuritySeverityFilter(f: 'ALL' | 'HIGH' | 'MEDIUM' | 'LOW') { this.securitySeverityFilter.set(f); }

  securityEventLabel(type: string): string {
    const map: Record<string, string> = {
      LOGIN_FAILED: 'admin.sec_login_failed',
      RATE_LIMITED: 'admin.sec_rate_limited',
      CHAT_ACCESS_DENIED: 'admin.sec_chat_denied',
      OFFER_ACCESS_DENIED: 'admin.sec_offer_denied',
      LISTING_STATUS_DENIED: 'admin.sec_status_denied',
      UPLOAD_REJECTED: 'admin.sec_upload_rejected',
      CAPTCHA_FAILED: 'admin.sec_captcha_failed',
    };
    const key = map[type];
    return key ? this.i18n.t(key) : type;
  }

  severityClass(s: string): string {
    return s === 'HIGH' ? 'badge-rejected' : s === 'MEDIUM' ? 'badge-pending' : 'badge-active';
  }

  isActionLoading(id: string) { return this.actionLoading.has(id); }

  async updateListingStatus(listing: Listing, status: string) {
    if (this.actionLoading.has(listing.id)) return;
    this.actionLoading.add(listing.id);
    try {
      await firstValueFrom(this.api.put(`/listings/${listing.id}`, { status }));
      listing.status = status as any;
    } catch { alert(this.i18n.t('admin.update_error')); }
    this.actionLoading.delete(listing.id);
    this.cdr.markForCheck();
  }

  /** Status picker in the listings table: any status can be set, e.g. a rejected listing put back online. */
  async onStatusChange(listing: Listing, ev: Event) {
    const select = ev.target as HTMLSelectElement;
    await this.updateListingStatus(listing, select.value);
    select.value = listing.status; // shows the real status again if the change was refused
  }

  readonly listingStatuses = ['ACTIVE', 'PENDING', 'RESERVED', 'SOLD', 'REJECTED', 'EXPIRED'];

  async togglePremium(listing: Listing) {
    if (this.actionLoading.has(listing.id)) return;
    this.actionLoading.add(listing.id);
    try {
      await firstValueFrom(this.api.put(`/listings/${listing.id}`, { isPremium: !listing.isPremium }));
      listing.isPremium = !listing.isPremium;
    } catch { alert(this.i18n.t('auth.generic_error')); }
    this.actionLoading.delete(listing.id);
    this.cdr.markForCheck();
  }

  async deleteListing(listing: Listing) {
    if (!confirm(this.i18n.t('admin.confirm_delete_listing', { title: listing.title }))) return;
    this.actionLoading.add(listing.id);
    try {
      await firstValueFrom(this.ls.delete(listing.id));
      this.allListings = this.allListings.filter(l => l.id !== listing.id);
    } catch { alert(this.i18n.t('admin.delete_error')); }
    this.actionLoading.delete(listing.id);
    this.cdr.markForCheck();
  }

  async updateUserRole(user: AdminUser, role: string) {
    try {
      await firstValueFrom(this.api.patch(`/admin/users/${user.id}`, { role }));
      user.role = role as any;
    } catch { alert(this.i18n.t('auth.generic_error')); }
    this.cdr.markForCheck();
  }

  getCategory(val: string) { return CATEGORIES.find(c => c.value === val); }

  statusLabel(s: string) {
    const map: Record<string, string> = {
      ACTIVE: 'annonces.active', PENDING: 'annonces.pending', REJECTED: 'annonces.rejected',
      SOLD: 'annonces.sold', RESERVED: 'annonces.reserved', EXPIRED: 'annonces.expired'
    };
    const key = map[s];
    return key ? this.i18n.t(key) : s;
  }
  statusClass(s: string) {
    const map: Record<string, string> = {
      ACTIVE: 'badge-active', PENDING: 'badge-pending',
      REJECTED: 'badge-rejected', SOLD: 'badge-sold',
      RESERVED: 'badge-reserved', EXPIRED: 'badge-rejected'
    };
    return map[s] ?? '';
  }
  roleClass(r: string) {
    return r === 'ADMIN' ? 'role-admin' : r === 'MODERATOR' ? 'role-mod' : 'role-user';
  }
}
