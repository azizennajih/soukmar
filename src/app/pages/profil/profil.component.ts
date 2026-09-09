import { Component, OnInit, inject, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService, AuthUser } from '../../services/auth.service';
import { UploadService } from '../../services/upload.service';
import { I18nService } from '../../services/i18n.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { firstValueFrom } from 'rxjs';
import { compressAvatar } from '../../utils/image-compression';

interface ProfileData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  city?: string;
  image?: string;
  accountType: 'PRIVATE' | 'BUSINESS';
  role: string;
  createdAt: string;
  phoneVerified?: boolean;
}

@Component({
  selector: 'app-profil',
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './profil.component.html',
  styleUrl: './profil.component.scss'
})
export class ProfilComponent implements OnInit {
  i18n = inject(I18nService);
  profile: ProfileData | null = null;
  loading = true;
  saving = signal(false);
  uploadingImage = signal(false);
  successMsg = '';
  errorMsg = '';

  form = { name: '', phone: '', city: '', accountType: 'PRIVATE' as 'PRIVATE' | 'BUSINESS' };

  pwForm = { currentPassword: '', newPassword: '', confirmPassword: '' };
  pwSaving = signal(false);
  pwSuccessMsg = '';
  pwErrorMsg = '';

  phoneCodeSent = signal(false);
  phoneCode = '';
  phoneSendingCode = signal(false);
  phoneVerifying = signal(false);
  phoneMsg = '';
  phoneErrorMsg = '';

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
      this.form.accountType = this.profile.accountType;
    } catch {
      this.errorMsg = this.i18n.t('profil.load_error');
    } finally {
      this.loading = false;
      this.cdr.markForCheck();
    }
  }

  async saveProfile() {
    if (!this.form.name.trim()) { this.errorMsg = this.i18n.t('profil.name_required'); return; }
    this.saving.set(true);
    this.successMsg = '';
    this.errorMsg = '';
    try {
      const updated = await firstValueFrom(this.api.put<ProfileData>('/auth/profile', {
        name: this.form.name.trim(),
        phone: this.form.phone || null,
        city: this.form.city || null,
        accountType: this.form.accountType,
      }));
      this.profile = updated;
      // A changed phone number invalidates any prior verification server-side —
      // drop any in-progress code entry for the old number to match.
      this.phoneCodeSent.set(false);
      this.phoneCode = '';
      this.phoneMsg = '';
      this.phoneErrorMsg = '';
      // Update auth signal
      const user = this.auth.currentUser();
      if (user) {
        const updatedUser: AuthUser = { ...user, name: updated.name, phone: updated.phone, city: updated.city, accountType: updated.accountType, phoneVerified: updated.phoneVerified };
        (this.auth as any).currentUser.set(updatedUser);
        localStorage.setItem('soukmar_session', JSON.stringify(updatedUser));
      }
      this.successMsg = this.i18n.t('profil.saved');
    } catch {
      this.errorMsg = this.i18n.t('profil.update_error');
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
      const compressed = await compressAvatar(file);
      const url = await firstValueFrom(this.upload.uploadFile(compressed));
      const updated = await firstValueFrom(this.api.put<ProfileData>('/auth/profile', { image: url }));
      this.profile = { ...this.profile!, image: updated.image };
      this.successMsg = this.i18n.t('profil.photo_updated');
    } catch {
      this.errorMsg = this.i18n.t('profil.photo_upload_error');
    } finally {
      this.uploadingImage.set(false);
    }
  }

  async sendPhoneCode() {
    this.phoneMsg = '';
    this.phoneErrorMsg = '';
    this.phoneSendingCode.set(true);
    try {
      await firstValueFrom(this.api.post('/auth/phone/send-code', {}));
      this.phoneCodeSent.set(true);
      this.phoneCode = '';
      this.phoneMsg = this.i18n.t('profil.phone_code_sent');
    } catch (e) {
      const err = e as { error?: { error?: string } };
      this.phoneErrorMsg = err?.error?.error || this.i18n.t('profil.phone_code_send_error');
    } finally {
      this.phoneSendingCode.set(false);
    }
  }

  async verifyPhoneCode() {
    if (!this.phoneCode.trim()) return;
    this.phoneMsg = '';
    this.phoneErrorMsg = '';
    this.phoneVerifying.set(true);
    try {
      await firstValueFrom(this.api.post('/auth/phone/verify', { code: this.phoneCode.trim() }));
      this.profile = { ...this.profile!, phoneVerified: true };
      this.phoneCodeSent.set(false);
      this.phoneCode = '';
      this.phoneMsg = this.i18n.t('profil.phone_verified_success');
      const user = this.auth.currentUser();
      if (user) {
        const updatedUser: AuthUser = { ...user, phoneVerified: true };
        (this.auth as any).currentUser.set(updatedUser);
        localStorage.setItem('soukmar_session', JSON.stringify(updatedUser));
      }
    } catch (e) {
      const err = e as { error?: { error?: string } };
      this.phoneErrorMsg = err?.error?.error || this.i18n.t('profil.phone_code_invalid');
    } finally {
      this.phoneVerifying.set(false);
    }
  }

  async changePassword() {
    this.pwSuccessMsg = '';
    this.pwErrorMsg = '';
    if (this.pwForm.newPassword.length < 6) { this.pwErrorMsg = this.i18n.t('profil.password_too_short'); return; }
    if (this.pwForm.newPassword !== this.pwForm.confirmPassword) { this.pwErrorMsg = this.i18n.t('profil.password_mismatch'); return; }

    this.pwSaving.set(true);
    try {
      await firstValueFrom(this.api.put('/auth/change-password', {
        currentPassword: this.pwForm.currentPassword,
        newPassword: this.pwForm.newPassword,
      }));
      this.pwSuccessMsg = this.i18n.t('profil.password_changed');
      this.pwForm = { currentPassword: '', newPassword: '', confirmPassword: '' };
    } catch (e) {
      const err = e as { error?: { error?: string } };
      this.pwErrorMsg = err?.error?.error || this.i18n.t('profil.password_change_error');
    } finally {
      this.pwSaving.set(false);
    }
  }

  get initials(): string {
    return (this.profile?.name || '?')[0].toUpperCase();
  }

  get memberSince(): string {
    if (!this.profile?.createdAt) return '';
    const lang = this.i18n.lang();
    const locale = lang === 'ar' ? 'ar-MA' : lang === 'en' ? 'en-US' : lang;
    return new Date(this.profile.createdAt).toLocaleDateString(locale, { year: 'numeric', month: 'long' });
  }
}
