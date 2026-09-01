import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

const BASE = 'http://127.0.0.1:3000/api';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN' | 'MODERATOR';
  phone?: string;
  city?: string;
}

const SESSION_KEY = 'soukmar_session';
const TOKEN_KEY = 'soukmar_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  currentUser = signal<AuthUser | null>(null);

  constructor(private router: Router) {
    const saved = localStorage.getItem(SESSION_KEY);
    if (saved) {
      try { this.currentUser.set(JSON.parse(saved)); } catch { }
    }
  }

  get isLoggedIn(): boolean {
    return this.currentUser() !== null;
  }

  get token(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  login(email: string, password: string): Promise<{ ok: boolean; unverified?: boolean; error?: string }> {
    return this.postJson<{ user: AuthUser; token: string }>('/auth/login', { email, password })
      .then(res => { this.setSession(res.user, res.token); return { ok: true }; })
      .catch(e => {
        const err = e as Record<string, unknown>;
        return {
          ok: false,
          unverified: err['unverified'] === true,
          error: typeof err['error'] === 'string' ? err['error'] : 'Email ou mot de passe incorrect.'
        };
      });
  }

  register(name: string, email: string, password: string, phone?: string, city?: string): Promise<{ ok: boolean; emailSent?: boolean; error?: string }> {
    return this.postJson<{ message: string; emailSent: boolean }>('/auth/register', { name, email, password, phone, city })
      .then(() => ({ ok: true, emailSent: true }))
      .catch(e => {
        const err = e as Record<string, unknown>;
        return {
          ok: false,
          error: typeof err['error'] === 'string' ? err['error'] : 'Une erreur est survenue. Veuillez réessayer.'
        };
      });
  }

  resendVerification(email: string): Promise<{ ok: boolean; error?: string }> {
    return this.postJson<{ message: string }>('/auth/resend-verification', { email })
      .then(() => ({ ok: true }))
      .catch(e => {
        const err = e as Record<string, unknown>;
        return { ok: false, error: typeof err['error'] === 'string' ? err['error'] : 'Erreur.' };
      });
  }

  private postJson<T>(path: string, body: unknown): Promise<T> {
    return fetch(`${BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).then(async res => {
      const data = await res.json();
      if (!res.ok) throw data;
      return data as T;
    });
  }

  logout(): void {
    this.currentUser.set(null);
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(TOKEN_KEY);
    this.router.navigate(['/']);
  }

  private setSession(user: AuthUser, token: string): void {
    this.currentUser.set(user);
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    localStorage.setItem(TOKEN_KEY, token);
  }
}
