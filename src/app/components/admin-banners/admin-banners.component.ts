import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { ApiService } from '../../services/api.service';
import { DialogService } from '../../services/dialog.service';
import { I18nService } from '../../services/i18n.service';
import { ToastService } from '../../services/toast.service';
import { UploadService } from '../../services/upload.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { ImageUrlPipe } from '../../pipes/image-url.pipe';
import { SponsorPlacement } from '../../services/sponsor.service';

interface AdminBanner {
  id: string; name: string; placement: SponsorPlacement; imageUrl: string; linkUrl: string; altText: string;
  countries: string[]; active: boolean; startsAt: string | null; endsAt: string | null; sortOrder: number; clicks: number;
}

interface Form {
  id: string | null; name: string; placement: SponsorPlacement; imageUrl: string; linkUrl: string; altText: string;
  countries: string; active: boolean; startsAt: string; endsAt: string; sortOrder: number;
}

const emptyForm = (): Form => ({
  id: null, name: '', placement: 'INLINE', imageUrl: '', linkUrl: '', altText: '', countries: '', active: true,
  startsAt: '', endsAt: '', sortOrder: 0,
});

/** Admin tab: advertising / affiliate banners (image, link, placement, countries, schedule, click count). */
@Component({
  selector: 'app-admin-banners',
  imports: [FormsModule, TranslatePipe, ImageUrlPipe],
  templateUrl: './admin-banners.component.html',
  styleUrl: './admin-banners.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminBannersComponent implements OnInit {
  private api = inject(ApiService);
  private uploads = inject(UploadService);
  private dialog = inject(DialogService);
  private toast = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);
  private i18n = inject(I18nService);

  banners: AdminBanner[] = [];
  loading = true;
  form: Form | null = null;
  saving = false;
  uploading = false;

  ngOnInit() { this.load(); }

  async load() {
    try { this.banners = await firstValueFrom(this.api.get<AdminBanner[]>('/admin/banners')); }
    catch { this.toast.error(this.i18n.t('admin_banners.load_failed')); }
    this.loading = false;
    this.cdr.markForCheck();
  }

  newBanner() { this.form = emptyForm(); }

  edit(b: AdminBanner) {
    this.form = {
      id: b.id, name: b.name, placement: b.placement, imageUrl: b.imageUrl, linkUrl: b.linkUrl, altText: b.altText,
      countries: b.countries.join(', '), active: b.active, startsAt: (b.startsAt ?? '').slice(0, 10),
      endsAt: (b.endsAt ?? '').slice(0, 10), sortOrder: b.sortOrder,
    };
  }

  cancel() { this.form = null; }

  async onImage(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file || !this.form) return;
    this.uploading = true;
    this.cdr.markForCheck();
    try { this.form.imageUrl = await firstValueFrom(this.uploads.uploadFile(file, 'banner')); }
    catch { this.toast.error(this.i18n.t('admin_banners.upload_failed')); }
    this.uploading = false;
    this.cdr.markForCheck();
  }

  private payload(f: Form) {
    return {
      name: f.name, placement: f.placement, imageUrl: f.imageUrl, linkUrl: f.linkUrl, altText: f.altText, active: f.active,
      countries: f.countries.split(/[\s,;]+/).filter(Boolean), sortOrder: Number(f.sortOrder) || 0,
      startsAt: f.startsAt || null, endsAt: f.endsAt ? f.endsAt + 'T23:59:59' : null,
    };
  }

  async save() {
    const f = this.form;
    if (!f || this.saving) return;
    this.saving = true;
    try {
      if (f.id) await firstValueFrom(this.api.put(`/admin/banners/${f.id}`, this.payload(f)));
      else await firstValueFrom(this.api.post('/admin/banners', this.payload(f)));
      this.toast.success(this.i18n.t('admin_banners.saved'));
      this.form = null;
      await this.load();
    } catch (e) {
      const msg = (e as { error?: { error?: string } })?.error?.error;
      this.toast.error(msg ?? this.i18n.t('admin_banners.save_failed'));
    }
    this.saving = false;
    this.cdr.markForCheck();
  }

  async toggle(b: AdminBanner) {
    try {
      await firstValueFrom(this.api.put(`/admin/banners/${b.id}`, { ...b, startsAt: b.startsAt, endsAt: b.endsAt, active: !b.active }));
      await this.load();
    } catch { this.toast.error(this.i18n.t('admin_banners.save_failed')); }
  }

  async remove(b: AdminBanner) {
    if (!(await this.dialog.confirm({ message: this.i18n.t('admin_banners.delete_confirm', { name: b.name }), danger: true }))) return;
    try {
      await firstValueFrom(this.api.delete(`/admin/banners/${b.id}`));
      this.toast.success(this.i18n.t('admin_banners.deleted'));
      await this.load();
    } catch { this.toast.error(this.i18n.t('admin_banners.save_failed')); }
  }
}
