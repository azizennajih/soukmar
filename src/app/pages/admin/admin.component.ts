import { Component, OnInit, signal, computed, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
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
import { firstValueFrom } from 'rxjs';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN' | 'MODERATOR';
  city?: string;
  phone?: string;
  createdAt: Date;
  _count?: { listings: number };
  banned?: boolean;
}

type Tab = 'overview' | 'listings' | 'users' | 'revenue' | 'reports' | 'security';
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
  imports: [CommonModule, RouterLink, FormsModule, CatIconComponent, IconComponent, TranslatePipe, CityLabelPipe],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export class AdminComponent implements OnInit {
  private api = inject(ApiService);
  private ls = inject(ListingService);
  private reportService = inject(ReportService);
  public auth = inject(AuthService);
  public i18n = inject(I18nService);
  private cdr = inject(ChangeDetectorRef);

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

  formatPrice = (p: number) => formatPrice(p, 'MAD', this.i18n.lang());
  timeAgo = (d: Date) => timeAgo(d, this.i18n.lang());

  ngOnInit() {
    this.loadListings();
    this.loadUsers();
    this.loadReports();
    this.loadSecurityEvents();
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
      const res = await firstValueFrom(this.api.get<any>('/listings', { limit: '500' }));
      this.allListings = res.listings ?? res;
    } catch { this.allListings = []; }
    this.loading.set(false);
    this.cdr.markForCheck();
  }

  private async loadUsers() {
    this.usersLoading.set(true);
    try {
      const res = await firstValueFrom(this.api.get<AdminUser[]>('/admin/users'));
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

  setTab(t: Tab) { this.tab.set(t); }
  setListingFilter(f: ListingFilter) { this.listingFilter.set(f); }
  setReportFilter(f: 'ALL' | 'PENDING' | 'RESOLVED' | 'DISMISSED') { this.reportFilter.set(f); }
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
