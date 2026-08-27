import { Component, signal, HostListener, OnInit, OnDestroy } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';
import { CATEGORIES } from '../../models/listing.model';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterLink, RouterLinkActive, FormsModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit, OnDestroy {
  categories = CATEGORIES;
  searchQuery = '';
  selectedCategory = '';
  mobileOpen = signal(false);
  userMenuOpen = signal(false);
  unreadCount = signal(0);
  private pollInterval: ReturnType<typeof setInterval> | null = null;

  constructor(public auth: AuthService, private api: ApiService, private router: Router) {}

  ngOnInit() {
    if (this.auth.isLoggedIn) this.startPolling();
  }

  ngOnDestroy() {
    if (this.pollInterval) clearInterval(this.pollInterval);
  }

  startPolling() {
    this.fetchUnread();
    this.pollInterval = setInterval(() => this.fetchUnread(), 30000);
  }

  fetchUnread() {
    if (!this.auth.isLoggedIn) return;
    this.api.get<{ count: number }>('/auth/unread-count').subscribe({
      next: res => this.unreadCount.set(res.count),
      error: () => {}
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(e: Event) {
    const target = e.target as HTMLElement;
    if (!target.closest('.user-menu-wrapper')) this.userMenuOpen.set(false);
  }

  search() {
    const params: Record<string, string> = {};
    if (this.searchQuery.trim()) params['q'] = this.searchQuery.trim();
    if (this.selectedCategory) params['categorie'] = this.selectedCategory;
    this.router.navigate(['/annonces'], { queryParams: params });
  }

  toggleMobile() { this.mobileOpen.update(v => !v); }
  toggleUserMenu(e: Event) { e.stopPropagation(); this.userMenuOpen.update(v => !v); }
  logout() { this.auth.logout(); this.userMenuOpen.set(false); this.unreadCount.set(0); }
}
