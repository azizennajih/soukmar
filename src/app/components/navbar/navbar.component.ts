import { Component, signal, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CATEGORIES } from '../../models/listing.model';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterLink, RouterLinkActive, FormsModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  categories = CATEGORIES;
  searchQuery = '';
  mobileOpen = signal(false);
  userMenuOpen = signal(false);

  constructor(public auth: AuthService, private router: Router) {}

  @HostListener('document:click', ['$event'])
  onDocumentClick(e: Event) {
    const target = e.target as HTMLElement;
    if (!target.closest('.user-menu-wrapper')) this.userMenuOpen.set(false);
  }

  search() {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/annonces'], { queryParams: { q: this.searchQuery } });
    }
  }

  toggleMobile() { this.mobileOpen.update(v => !v); }
  toggleUserMenu(e: Event) { e.stopPropagation(); this.userMenuOpen.update(v => !v); }
  logout() { this.auth.logout(); this.userMenuOpen.set(false); }
}
