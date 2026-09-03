import { Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiService } from './api.service';

export interface AppNotification {
  id: string;
  userId: string;
  type: 'NEW_INQUIRY' | 'NEW_REPLY' | 'NEW_MESSAGE' | 'NEW_REVIEW' | 'SAVED_SEARCH_MATCH';
  actorName: string | null;
  listingId: string | null;
  listingTitle: string | null;
  conversationId: string | null;
  isRead: boolean;
  createdAt: Date;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  unreadCount = signal(0);

  constructor(private api: ApiService) {}

  getAll(): Promise<AppNotification[]> {
    return firstValueFrom(this.api.get<AppNotification[]>('/notifications'));
  }

  async refreshUnreadCount() {
    try {
      const res = await firstValueFrom(this.api.get<{ count: number }>('/notifications/unread-count'));
      this.unreadCount.set(res.count);
    } catch { /* silently ignore */ }
  }

  async markRead(id: string) {
    await firstValueFrom(this.api.patch<AppNotification>(`/notifications/${id}/read`, {}));
    this.unreadCount.update(n => Math.max(0, n - 1));
  }

  async markAllRead() {
    await firstValueFrom(this.api.patch<{ success: boolean }>('/notifications/read-all', {}));
    this.unreadCount.set(0);
  }
}
