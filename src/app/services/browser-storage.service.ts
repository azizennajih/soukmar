import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/** localStorage doesn't exist during SSR — every access must go through
 * this so services can be safely instantiated on the server (a no-op
 * store there) as well as in the browser. */
@Injectable({ providedIn: 'root' })
export class BrowserStorageService {
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  getItem(key: string): string | null {
    return this.isBrowser ? localStorage.getItem(key) : null;
  }

  setItem(key: string, value: string): void {
    if (this.isBrowser) localStorage.setItem(key, value);
  }

  removeItem(key: string): void {
    if (this.isBrowser) localStorage.removeItem(key);
  }
}
