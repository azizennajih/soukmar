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
      const msg = this.extractError(e, 'Email ou mot de passe incorrect.');
      return { ok: false, error: msg };
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
      const msg = this.extractError(e, 'Une erreur est survenue. Veuillez réessayer.');
      return { ok: false, error: msg };
    }
  }

  private extractError(e: unknown, fallback: string): string {
    if (!e || typeof e !== 'object') return fallback;
    const err = e as Record<string, unknown>;
    // HttpErrorResponse: err.error is the parsed body
    if (err['error'] && typeof err['error'] === 'object') {
      const body = err['error'] as Record<string, unknown>;
      if (typeof body['error'] === 'string') return body['error'];
      if (typeof body['message'] === 'string') return body['message'];
    }
    if (typeof err['message'] === 'string' && err['message'].includes('Http')) return 'Serveur inaccessible. Vérifiez votre connexion.';
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
