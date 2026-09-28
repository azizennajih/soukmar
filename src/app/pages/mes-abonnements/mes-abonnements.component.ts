import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { LocalizedRouterLinkDirective } from '../../directives/localized-router-link.directive';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { I18nService } from '../../services/i18n.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { CityLabelPipe } from '../../pipes/city-label.pipe';
import { FollowedUser } from '../../models/listing.model';
import { IconComponent } from '../../components/icon/icon.component';
import { VerifiedBadgeComponent } from '../../components/verified-badge/verified-badge.component';
import { FollowButtonComponent } from '../../components/follow-button/follow-button.component';

@Component({
  selector: 'app-mes-abonnements',
  imports: [CommonModule, RouterLink, LocalizedRouterLinkDirective, TranslatePipe, CityLabelPipe, IconComponent, VerifiedBadgeComponent, FollowButtonComponent],
  templateUrl: './mes-abonnements.component.html',
  styleUrl: './mes-abonnements.component.scss'
})
export class MesAbonnementsComponent implements OnInit {
  i18n = inject(I18nService);
  users: FollowedUser[] = [];
  loading = false;

  constructor(public auth: AuthService, private userService: UserService, private router: Router, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    if (!this.auth.isLoggedIn) { this.router.navigate(this.i18n.withLang(['/auth/login'])); return; }
    this.loading = true;
    this.userService.getFollowing().subscribe({
      next: users => { this.users = users; this.loading = false; this.cdr.markForCheck(); },
      error: () => { this.loading = false; this.cdr.markForCheck(); }
    });
  }

  onUnfollow(userId: string, following: boolean) {
    if (following) return;
    this.users = this.users.filter(u => u.id !== userId);
    this.cdr.markForCheck();
  }
}
