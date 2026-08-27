import { Component, OnInit, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService, AuthUser } from '../../services/auth.service';
import { UploadService } from '../../services/upload.service';
import { firstValueFrom } from 'rxjs';

interface ProfileData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  city?: string;
  image?: string;
  role: string;
  createdAt: string;
}

@Component({
  selector: 'app-profil',
  imports: [CommonModule, FormsModule],
  templateUrl: './profil.component.html',
  styleUrl: './profil.component.scss'
})
export class ProfilComponent implements OnInit {
  profile: ProfileData | null = null;
  loading = true;
  saving = signal(false);
  uploadingImage = signal(false);
  successMsg = '';
  errorMsg = '';

  form = { name: '', phone: '', city: '' };

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private upload: UploadService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    if (!this.auth.isLoggedIn) { this.router.navigate(['/auth/login']); return; }
    this.loadProfile();
  }

  async loadProfile() {
    try {
      this.profile = await firstValueFrom(this.api.get<ProfileData>('/auth/me'));
      this.form.name = this.profile.name;
      this.form.phone = this.profile.phone || '';
      this.form.city = this.profile.city || '';
    } catch {
      this.errorMsg = 'Impossible de charger le profil.';
    } finally {
      this.loading = false;
      this.cdr.markForCheck();
    }
  }

  async saveProfile() {
    if (!this.form.name.trim()) { this.errorMsg = 'Le nom est requis.'; return; }
    this.saving.set(true);
    this.successMsg = '';
    this.errorMsg = '';
    try {
      const updated = await firstValueFrom(this.api.put<ProfileData>('/auth/profile', {
        name: this.form.name.trim(),
        phone: this.form.phone || null,
        city: this.form.city || null,
      }));
      this.profile = updated;
      // Update auth signal
      const user = this.auth.currentUser();
      if (user) {
        const updatedUser: AuthUser = { ...user, name: updated.name, phone: updated.phone, city: updated.city };
        (this.auth as any).currentUser.set(updatedUser);
        localStorage.setItem('soukmar_session', JSON.stringify(updatedUser));
      }
      this.successMsg = 'Profil mis à jour avec succès !';
    } catch {
      this.errorMsg = 'Erreur lors de la mise à jour.';
    } finally {
      this.saving.set(false);
    }
  }

  async onImageChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.uploadingImage.set(true);
    this.errorMsg = '';
    try {
      const url = await firstValueFrom(this.upload.uploadFile(file));
      const updated = await firstValueFrom(this.api.put<ProfileData>('/auth/profile', { image: url }));
      this.profile = { ...this.profile!, image: updated.image };
      this.successMsg = 'Photo de profil mise à jour !';
    } catch {
      this.errorMsg = 'Erreur lors du téléchargement de la photo.';
    } finally {
      this.uploadingImage.set(false);
    }
  }

  get initials(): string {
    return (this.profile?.name || '?')[0].toUpperCase();
  }

  get memberSince(): string {
    if (!this.profile?.createdAt) return '';
    return new Date(this.profile.createdAt).toLocaleDateString('fr-MA', { year: 'numeric', month: 'long' });
  }
}
