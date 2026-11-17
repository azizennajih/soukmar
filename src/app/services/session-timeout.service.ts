import { Injectable, Injector, PLATFORM_ID, effect, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from './auth.service';
import { BrowserStorageService } from './browser-storage.service';
import { I18nService } from './i18n.service';
import { ToastService } from './toast.service';
import { apiBase } from '../config/api.config';

/** Signed out after this long (3 hours) without any input. The server enforces the same limit by letting
 * the login token expire (WEB_IDLE_SECONDS in the backend) — this timer is only the friendly part. */
const IDLE_MS = 3 * 60 * 60_000;
const WARN_MS = 2 * 60_000;
const REFRESH_EVERY_MS = 5 * 60_000;
const TICK_MS = 15_000;
/** Shared by all tabs: activity in one tab keeps the others signed in. */
const ACTIVITY_KEY = 'soukmar_last_activity';
const ACTIVITY_EVENTS = ['pointerdown', 'keydown', 'scroll', 'touchstart', 'mousemove'] as const;

@Injectable({ providedIn: 'root' })
export class SessionTimeoutService {
  private auth = inject(AuthService);
  private storage = inject(BrowserStorageService);
  private i18n = inject(I18nService);
  private toast = inject(ToastService);
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private injector = inject(Injector);

  private lastWrite = 0;
  private lastRefresh = Date.now();
  private warned = false;
  private timer: ReturnType<typeof setInterval> | null = null;

  start(): void {
    if (!this.isBrowser) return;
    for (const ev of ACTIVITY_EVENTS) addEventListener(ev, () => this.markActive(), { passive: true, capture: true });
    // Timers are throttled in background tabs and stop while the computer sleeps — re-check on return.
    document.addEventListener('visibilitychange', () => { if (!document.hidden) this.check(); });
    effect(() => {
      if (this.auth.currentUser()) this.arm(); else this.disarm();
    }, { injector: this.injector });
  }

  private arm(): void {
    if (this.timer) return;
    // A login left behind in a closed browser: the idle limit applies to the time the browser was closed too.
    const last = Number(this.storage.getItem(ACTIVITY_KEY)) || 0;
    if (last && Date.now() - last > IDLE_MS) { this.expire(); return; }
    this.lastRefresh = Date.now();
    this.warned = false;
    this.markActive(true);
    this.timer = setInterval(() => this.check(), TICK_MS);
  }

  private disarm(): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    this.storage.removeItem(ACTIVITY_KEY);
  }

  private markActive(force = false): void {
    const now = Date.now();
    if (!force && now - this.lastWrite < 5_000) return;
    this.lastWrite = now;
    if (this.auth.isLoggedIn) this.storage.setItem(ACTIVITY_KEY, String(now));
  }

  private check(): void {
    if (!this.auth.isLoggedIn) return;
    const idle = Date.now() - (Number(this.storage.getItem(ACTIVITY_KEY)) || 0);
    if (idle >= IDLE_MS) { this.expire(); return; }
    if (idle >= IDLE_MS - WARN_MS) {
      if (!this.warned) { this.warned = true; this.toast.info(this.i18n.t('auth.session_expiring')); }
      return;
    }
    this.warned = false;
    if (Date.now() - this.lastRefresh >= REFRESH_EVERY_MS) void this.refresh();
  }

  /** Asks the server for a fresh token — only ever called while the user is active, so an idle session
   * is never extended. A rejection means the server already ended the session. */
  private async refresh(): Promise<void> {
    const token = this.auth.token;
    if (!token) return;
    this.lastRefresh = Date.now();
    try {
      const res = await fetch(`${apiBase()}/auth/refresh`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
      if (res.status === 401) { this.expire(); return; }
      if (!res.ok) return;
      const body = await res.json() as { token?: string };
      if (body.token) this.auth.replaceToken(body.token);
    } catch { /* offline: try again on the next tick */ }
  }

  private expire(): void {
    this.disarm();
    this.auth.logout();
    this.toast.info(this.i18n.t('auth.session_expired'));
  }
}
