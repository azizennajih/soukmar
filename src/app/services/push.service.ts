import { Injectable, signal } from '@angular/core';
import { ApiService } from './api.service';
import { firstValueFrom } from 'rxjs';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)));
}

@Injectable({ providedIn: 'root' })
export class PushService {
  subscribed = signal(false);
  supported = typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window;

  constructor(private api: ApiService) {
    if (this.supported) this.checkExistingSubscription();
  }

  private async checkExistingSubscription() {
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      const sub = await reg?.pushManager.getSubscription();
      this.subscribed.set(!!sub);
    } catch { /* not registered yet */ }
  }

  async subscribe(): Promise<boolean> {
    if (!this.supported) return false;
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') return false;

      const reg = await navigator.serviceWorker.register('/sw.js');
      const { key } = await firstValueFrom(this.api.get<{ key: string }>('/push/vapid-public-key'));
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(key) as BufferSource
      });
      const json = sub.toJSON();
      await firstValueFrom(this.api.post('/push/subscribe', { endpoint: json.endpoint, keys: json.keys }));
      this.subscribed.set(true);
      return true;
    } catch (e) {
      console.error('Push subscribe failed:', e);
      return false;
    }
  }

  async unsubscribe(): Promise<void> {
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      const sub = await reg?.pushManager.getSubscription();
      if (sub) {
        await firstValueFrom(this.api.post('/push/unsubscribe', { endpoint: sub.endpoint }));
        await sub.unsubscribe();
      }
      this.subscribed.set(false);
    } catch (e) {
      console.error('Push unsubscribe failed:', e);
    }
  }
}
