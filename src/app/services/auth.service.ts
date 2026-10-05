import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { I18nService } from './i18n.service';
import { BrowserStorageService } from './browser-storage.service';
import { apiBase } from '../config/api.config';

const BASE = apiBase();

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN' | 'MODERATOR';
  phone?: string;
  city?: string;
  /** Chosen at registration, fixed for regular users — see CountryService's
   * pinning of the browsing country for non-ADMIN accounts. */
  country: string;
  accountType?: 'PRIVATE' | 'BUSINESS';
  phoneVerified?: boolean;
}

const SESSION_KEY = 'soukmar_session';
const TOKEN_KEY = 'soukmar_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private i18n = inject(I18nService);
  private storage = inject(BrowserStorageService);
  currentUser = signal<AuthUser | null>(null);

  constructor(private router: Router) {
    const saved = this.storage.getItem(SESSION_KEY);
    if (saved) {
      try { this.currentUser.set(JSON.parse(saved)); } catch { }
    }
    this.refreshFromServer();
  }

  /** The saved session can be stale (e.g. saved before accounts had a
   * country, or verification flags changed since) — reload it from the
   * server once on startup. Only runs in the browser, where a token exists. */
  private refreshFromServer(): void {
    const token = this.token;
    if (!token) return;
    fetch(`${BASE}/auth/me`, { headers: { Authorization: `Bearer ${token}`, 'Accept-Language': this.i18n.lang() } })
      .then(async res => {
        // 401: token expired; 404: the account no longer exists — either way the saved login is useless.
        if (res.status === 401 || res.status === 404) {
          this.currentUser.set(null);
          this.storage.removeItem(SESSION_KEY);
          this.storage.removeItem(TOKEN_KEY);
          return;
        }
        if (!res.ok) return;
        const fresh = await res.json() as AuthUser;
        this.currentUser.set(fresh);
        this.storage.setItem(SESSION_KEY, JSON.stringify(fresh));
      })
      .catch(() => { /* offline or backend down: keep the saved session */ });
  }

  get isLoggedIn(): boolean {
    return this.currentUser() !== null;
  }

  get token(): string | null {
    return this.storage.getItem(TOKEN_KEY);
  }

  login(email: string, password: string): Promise<{ ok: boolean; unverified?: boolean; error?: string }> {
    return this.postJson<{ user: AuthUser; token: string }>('/auth/login', { email, password, lang: this.i18n.lang() })
      .then(res => { this.setSession(res.user, res.token); return { ok: true }; })
      .catch(e => {
        const err = e as Record<string, unknown>;
        return {
          ok: false,
          unverified: err['unverified'] === true,
          error: typeof err['error'] === 'string' ? err['error'] : this.i18n.t('auth.invalid_credentials')
        };
      });
  }

  register(name: string, email: string, password: string, phone?: string, city?: string, captchaToken?: string, accountType?: 'PRIVATE' | 'BUSINESS', country?: string): Promise<{ ok: boolean; emailSent?: boolean; error?: string }> {
    return this.postJson<{ message: string; emailSent: boolean }>('/auth/register', { name, email, password, phone, city, captchaToken, accountType, country, lang: this.i18n.lang() })
      .then(res => ({ ok: true, emailSent: res.emailSent }))
      .catch(e => {
        const err = e as Record<string, unknown>;
        return {
          ok: false,
          error: typeof err['error'] === 'string' ? err['error'] : this.i18n.t('auth.generic_error_retry')
        };
      });
  }

  resendVerification(email: string): Promise<{ ok: boolean; error?: string }> {
    return this.postJson<{ message: string }>('/auth/resend-verification', { email, lang: this.i18n.lang() })
      .then(() => ({ ok: true }))
      .catch(e => {
        const err = e as Record<string, unknown>;
        return { ok: false, error: typeof err['error'] === 'string' ? err['error'] : this.i18n.t('auth.generic_error') };
      });
  }

  forgotPassword(email: string): Promise<{ ok: boolean; error?: string }> {
    return this.postJson<{ message: string }>('/auth/forgot-password', { email, lang: this.i18n.lang() })
      .then(() => ({ ok: true }))
      .catch(e => {
        const err = e as Record<string, unknown>;
        return { ok: false, error: typeof err['error'] === 'string' ? err['error'] : this.i18n.t('auth.generic_error') };
      });
  }

  resetPassword(token: string, password: string): Promise<{ ok: boolean; error?: string }> {
    return this.postJson<{ message: string }>('/auth/reset-password', { token, password })
      .then(() => ({ ok: true }))
      .catch(e => {
        const err = e as Record<string, unknown>;
        return { ok: false, error: typeof err['error'] === 'string' ? err['error'] : this.i18n.t('auth.generic_error') };
      });
  }

  private postJson<T>(path: string, body: unknown): Promise<T> {
    return fetch(`${BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept-Language': this.i18n.lang() },
      body: JSON.stringify(body),
    }).then(async res => {
      const data = await res.json();
      if (!res.ok) throw data;
      return data as T;
    });
  }

  logout(): void {
    this.currentUser.set(null);
    this.storage.removeItem(SESSION_KEY);
    this.storage.removeItem(TOKEN_KEY);
    this.router.navigate(this.i18n.withLang(['/']));
  }

  private setSession(user: AuthUser, token: string): void {
    this.currentUser.set(user);
    this.storage.setItem(SESSION_KEY, JSON.stringify(user));
    this.storage.setItem(TOKEN_KEY, token);
  }
}
