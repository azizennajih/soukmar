import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpInterceptorFn } from '@angular/common/http';
import { NavigationEnd, Router } from '@angular/router';
import { finalize } from 'rxjs';

const SETTLE_MS = 250;
const MAX_WAIT_MS = 4000;

/** True once the very first page load has settled (first navigation done and
 * no API request in flight for SETTLE_MS) — used to keep the footer hidden
 * until then, so it doesn't sit right under a half-empty page and visibly jump
 * down as content arrives. Only gates the first load; later navigations never
 * hide it again. */
@Injectable({ providedIn: 'root' })
export class AppReadyService {
  private router = inject(Router);
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private pending = 0;
  private navigated = false;
  private timer: ReturnType<typeof setTimeout> | null = null;

  ready = signal(false);

  constructor() {
    if (!this.isBrowser) return;
    setTimeout(() => this.markReady(), MAX_WAIT_MS);
    this.router.events.subscribe(e => {
      if (e instanceof NavigationEnd) {
        this.navigated = true;
        this.check();
      }
    });
  }

  requestStarted() { this.pending++; }

  requestFinished() {
    this.pending = Math.max(0, this.pending - 1);
    this.check();
  }

  private check() {
    if (this.ready()) return;
    if (this.timer) clearTimeout(this.timer);
    if (this.navigated && this.pending === 0) {
      this.timer = setTimeout(() => {
        if (this.navigated && this.pending === 0) this.markReady();
      }, SETTLE_MS);
    }
  }

  private markReady() {
    if (this.timer) clearTimeout(this.timer);
    this.ready.set(true);
  }
}

export const appReadyInterceptor: HttpInterceptorFn = (req, next) => {
  const appReady = inject(AppReadyService);
  appReady.requestStarted();
  return next(req).pipe(finalize(() => appReady.requestFinished()));
};
