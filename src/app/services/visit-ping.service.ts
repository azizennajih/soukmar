import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { apiBase } from '../config/api.config';

/** Tells the backend that this tab is open, once a minute while it is visible — the numbers behind the
 * admin dashboard's "active now" and visitors-per-country charts. Nothing is stored on the visitor's
 * device and the request carries no data: the server counts anonymously (see backend lib/analytics.ts). */
@Injectable({ providedIn: 'root' })
export class VisitPingService {
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private started = false;
  private lastPing = 0;

  start() {
    if (!this.isBrowser || this.started) return;
    this.started = true;
    this.ping();
    setInterval(() => this.ping(), 60_000);
    document.addEventListener('visibilitychange', () => this.ping());
  }

  private ping() {
    if (document.visibilityState !== 'visible') return;
    // However often the browser reports a tab switch, one heartbeat per half minute is enough.
    if (Date.now() - this.lastPing < 30_000) return;
    this.lastPing = Date.now();
    try {
      void fetch(`${apiBase()}/analytics/ping`, { method: 'POST', keepalive: true, credentials: 'omit' }).catch(() => undefined);
    } catch { /* counting is best effort */ }
  }
}
