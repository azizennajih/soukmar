import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificationService, AppNotification } from '../../services/notification.service';
import { I18nService } from '../../services/i18n.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { timeAgo } from '../../models/listing.model';
import { PushService } from '../../services/push.service';

@Component({
  selector: 'app-notifications',
  imports: [CommonModule, TranslatePipe],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationsComponent implements OnInit {
  notifications: AppNotification[] = [];
  loading = false;

  constructor(
    public auth: AuthService,
    private notifService: NotificationService,
    public i18n: I18nService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    public pushService: PushService
  ) {}

  async enablePush() {
    await this.pushService.subscribe();
    this.cdr.markForCheck();
  }

  ngOnInit() {
    if (!this.auth.isLoggedIn) { this.router.navigate(['/auth/login']); return; }
    this.loading = true;
    this.notifService.getAll().then(notifications => {
      this.notifications = notifications;
      this.loading = false;
      this.cdr.markForCheck();
    }).catch(() => { this.loading = false; this.cdr.markForCheck(); });
  }

  get hasUnread(): boolean {
    return this.notifications.some(n => !n.isRead);
  }

  text(n: AppNotification): string {
    const key = n.type === 'NEW_INQUIRY' ? 'notifications.new_inquiry'
      : n.type === 'NEW_REPLY' ? 'notifications.new_reply'
      : n.type === 'NEW_REVIEW' ? 'notifications.new_review'
      : n.type === 'SAVED_SEARCH_MATCH' ? 'notifications.saved_search_match'
      : n.type === 'REPORT_RESOLVED' ? 'notifications.report_resolved'
      : 'notifications.new_message';
    return this.i18n.t(key, { name: n.actorName || '' });
  }

  time(n: AppNotification): string {
    return timeAgo(n.createdAt, this.i18n.lang());
  }

  async open(n: AppNotification) {
    if (!n.isRead) {
      n.isRead = true;
      this.cdr.markForCheck();
      this.notifService.markRead(n.id);
    }
    if (n.type === 'NEW_REVIEW') { this.router.navigate(['/profil'], { queryParams: { tab: 'reviews' } }); return; }
    if (n.type === 'REPORT_RESOLVED') { return; }
    if (n.type === 'SAVED_SEARCH_MATCH' && n.listingId) { this.router.navigate(['/annonces', n.listingId]); return; }
    if (n.listingId) this.router.navigate(['/chat'], { queryParams: { listing: n.listingId } });
  }

  async markAllRead() {
    this.notifications.forEach(n => n.isRead = true);
    this.cdr.markForCheck();
    await this.notifService.markAllRead();
  }
}
