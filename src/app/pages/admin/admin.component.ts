import { Component, OnInit, signal, computed, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { ListingService } from '../../services/listing.service';
import { AuthService } from '../../services/auth.service';
import { Listing, CATEGORIES, formatPrice } from '../../models/listing.model';
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

type Tab = 'overview' | 'listings' | 'users' | 'revenue';
type ListingFilter = 'ALL' | 'ACTIVE' | 'PENDING' | 'REJECTED' | 'SOLD' | 'RESERVED';

@Component({
  selector: 'app-admin',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export class AdminComponent implements OnInit {
  private api = inject(ApiService);
  private ls = inject(ListingService);
  public auth = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  tab = signal<Tab>('overview');
  loading = signal(true);
  usersLoading = signal(false);

  allListings: Listing[] = [];
  users: AdminUser[] = [];
  listingFilter = signal<ListingFilter>('ALL');
  userSearch = '';

  actionLoading = new Set<string>();

  readonly CATEGORIES = CATEGORIES;
  readonly filterOptions: ListingFilter[] = ['ALL','ACTIVE','PENDING','REJECTED','SOLD','RESERVED'];

  readonly monthLabels = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];

  get filteredListings(): Listing[] {
    const f = this.listingFilter();
    return f === 'ALL' ? this.allListings : this.allListings.filter(l => l.status === f);
  }

  get filteredUsers(): AdminUser[] {
    const q = this.userSearch.toLowerCase();
    return q ? this.users.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)) : this.users;
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

  formatPrice = (p: number) => formatPrice(p, 'MAD', 'fr');

  ngOnInit() {
    this.loadListings();
    this.loadUsers();
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

  isActionLoading(id: string) { return this.actionLoading.has(id); }

  async updateListingStatus(listing: Listing, status: string) {
    if (this.actionLoading.has(listing.id)) return;
    this.actionLoading.add(listing.id);
    try {
      await firstValueFrom(this.api.patch(`/listings/${listing.id}`, { status }));
      listing.status = status as any;
    } catch { alert('Erreur lors de la mise à jour.'); }
    this.actionLoading.delete(listing.id);
    this.cdr.markForCheck();
  }

  async togglePremium(listing: Listing) {
    if (this.actionLoading.has(listing.id)) return;
    this.actionLoading.add(listing.id);
    try {
      await firstValueFrom(this.api.patch(`/listings/${listing.id}`, { isPremium: !listing.isPremium }));
      listing.isPremium = !listing.isPremium;
    } catch { alert('Erreur.'); }
    this.actionLoading.delete(listing.id);
    this.cdr.markForCheck();
  }

  async deleteListing(listing: Listing) {
    if (!confirm(`Supprimer "${listing.title}" ?`)) return;
    this.actionLoading.add(listing.id);
    try {
      await firstValueFrom(this.ls.delete(listing.id));
      this.allListings = this.allListings.filter(l => l.id !== listing.id);
    } catch { alert('Erreur lors de la suppression.'); }
    this.actionLoading.delete(listing.id);
    this.cdr.markForCheck();
  }

  async updateUserRole(user: AdminUser, role: string) {
    try {
      await firstValueFrom(this.api.patch(`/admin/users/${user.id}`, { role }));
      user.role = role as any;
    } catch { alert('Erreur.'); }
    this.cdr.markForCheck();
  }

  getCategory(val: string) { return CATEGORIES.find(c => c.value === val); }

  statusLabel(s: string) {
    const map: Record<string, string> = {
      ACTIVE: 'Actif', PENDING: 'En attente', REJECTED: 'Rejeté',
      SOLD: 'Vendu', RESERVED: 'Réservé', EXPIRED: 'Expiré'
    };
    return map[s] ?? s;
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
