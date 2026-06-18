import { Injectable, signal } from '@angular/core';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  currentUser = signal<AuthUser | null>(null);

  get isLoggedIn(): boolean {
    return this.currentUser() !== null;
  }

  login(email: string, password: string): boolean {
    // Mock authentication
    if (email && password.length >= 6) {
      this.currentUser.set({
        id: 'current-user',
        name: email.split('@')[0],
        email,
        role: email.includes('admin') ? 'ADMIN' : 'USER',
      });
      return true;
    }
    return false;
  }

  register(name: string, email: string, password: string): boolean {
    if (name && email && password.length >= 6) {
      this.currentUser.set({ id: Date.now().toString(), name, email, role: 'USER' });
      return true;
    }
    return false;
  }

  logout(): void {
    this.currentUser.set(null);
  }
}
