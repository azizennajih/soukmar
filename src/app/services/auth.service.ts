import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ApiService } from './api.service';

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

  async login(email: string, password: string): Promise<{ ok: boolean; error?: string }> {
    try {
      const res = await firstValueFrom(
        this.api.post<{ user: AuthUser; token: string }>('/auth/login', { email, password })
      );
      this.setSession(res.user, res.token);
      return { ok: true };
    } catch (e: unknown) {
      const err = e as { error?: { error?: string } };
      return { ok: false, error: err?.error?.error || 'Email ou mot de passe incorrect.' };
    }
  }

  async register(name: string, email: string, password: string, phone?: string, city?: string): Promise<{ ok: boolean; error?: string }> {
    try {
      const res = await firstValueFrom(
        this.api.post<{ user: AuthUser; token: string }>('/auth/register', { name, email, password, phone, city })
      );
      this.setSession(res.user, res.token);
      return { ok: true };
    } catch (e: unknown) {
      const err = e as { error?: { error?: string } };
      return { ok: false, error: err?.error?.error || 'Une erreur est survenue. Veuillez réessayer.' };
    }
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
