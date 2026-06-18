import { Injectable, signal } from '@angular/core';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
}

interface StoredUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'USER' | 'ADMIN';
}

const STORAGE_KEY = 'soukmar_users';
const SESSION_KEY = 'soukmar_session';

@Injectable({ providedIn: 'root' })
export class AuthService {
  currentUser = signal<AuthUser | null>(null);

  constructor() {
    // Restore session from localStorage on app start
    const saved = localStorage.getItem(SESSION_KEY);
    if (saved) {
      try { this.currentUser.set(JSON.parse(saved)); } catch { }
    }
  }

  get isLoggedIn(): boolean {
    return this.currentUser() !== null;
  }

  private getUsers(): StoredUser[] {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
  }

  private saveUsers(users: StoredUser[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  }

  login(email: string, password: string): { ok: boolean; error?: string } {
    const users = this.getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      return { ok: false, error: 'Aucun compte trouvé avec cet email.' };
    }
    if (user.password !== password) {
      return { ok: false, error: 'Mot de passe incorrect.' };
    }

    const authUser: AuthUser = { id: user.id, name: user.name, email: user.email, role: user.role };
    this.currentUser.set(authUser);
    localStorage.setItem(SESSION_KEY, JSON.stringify(authUser));
    return { ok: true };
  }

  register(name: string, email: string, password: string): { ok: boolean; error?: string } {
    if (!name.trim() || !email.trim() || password.length < 6) {
      return { ok: false, error: 'Veuillez remplir tous les champs correctement.' };
    }

    const users = this.getUsers();
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { ok: false, error: 'Un compte avec cet email existe déjà.' };
    }

    const newUser: StoredUser = {
      id: Date.now().toString(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      role: 'USER',
    };
    users.push(newUser);
    this.saveUsers(users);

    const authUser: AuthUser = { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role };
    this.currentUser.set(authUser);
    localStorage.setItem(SESSION_KEY, JSON.stringify(authUser));
    return { ok: true };
  }

  logout(): void {
    this.currentUser.set(null);
    localStorage.removeItem(SESSION_KEY);
  }
}
