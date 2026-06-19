import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from './api.service';

const BASE = 'http://localhost:3000/api';

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

  constructor(private api: ApiService, private router: Router) {
    const saved = localStorage.getItem(SESSION_KEY);
    if (saved) {
      try { this.currentUser.set(JSON.parse(saved)); } catch { }
    }
  }

  get isLoggedIn(): boolean {
    return this.currentUser() !== null;
  }

  login(email: string, password: string): Promise<{ ok: boolean; error?: string }> {
    return this.postJson<{ user: AuthUser; token: string }>('/auth/login', { email, password })
      .then(res => { this.setSession(res.user, res.token); return { ok: true }; })
      .catch(e => ({ ok: false, error: this.extractError(e, 'Email ou mot de passe incorrect.') }));
  }

  register(name: string, email: string, password: string, phone?: string, city?: string): Promise<{ ok: boolean; error?: string }> {
    return this.postJson<{ user: AuthUser; token: string }>('/auth/register', { name, email, password, phone, city })
      .then(res => { this.setSession(res.user, res.token); return { ok: true }; })
      .catch(e => ({ ok: false, error: this.extractError(e, 'Une erreur est survenue. Veuillez réessayer.') }));
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

  private extractError(e: unknown, fallback: string): string {
    if (!e || typeof e !== 'object') return fallback;
    const err = e as Record<string, unknown>;
    if (typeof err['error'] === 'string') return err['error'];
    if (typeof err['message'] === 'string') return err['message'];
    return fallback;
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
