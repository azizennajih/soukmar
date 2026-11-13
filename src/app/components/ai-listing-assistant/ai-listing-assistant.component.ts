import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, PLATFORM_ID, inject, input, output } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { AiCategorySuggestion, AiListingDraft, AiListingService } from '../../services/ai-listing.service';
import { I18nService } from '../../services/i18n.service';
import { DialogService } from '../../services/dialog.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { IconComponent } from '../icon/icon.component';
import { CatIconComponent } from '../cat-icon/cat-icon.component';
import { Category } from '../../models/listing.model';

export interface AiPhoto { url: string; file?: File; }

/** What "apply suggestion" hands to the listing form. */
export interface AiApplyPayload {
  title: string;
  description: string;
  category: string;
  subcategoryId: string | null;
  attributes: Record<string, string | boolean>;
}

/**
 * "Create the listing with AI": lives above the wizard steps of the listing form, so its photos' analysis
 * result and the edited texts survive every back/next. The photos themselves belong to the form (same list
 * as the regular photo step). Nothing is written into the form before the user presses "apply".
 */
@Component({
  selector: 'app-ai-listing-assistant',
  imports: [FormsModule, TranslatePipe, IconComponent, CatIconComponent],
  templateUrl: './ai-listing-assistant.component.html',
  styleUrl: './ai-listing-assistant.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AiListingAssistantComponent implements OnInit, OnDestroy {
  private ai = inject(AiListingService);
  private i18n = inject(I18nService);
  private dialog = inject(DialogService);
  private cdr = inject(ChangeDetectorRef);
  private browser = isPlatformBrowser(inject(PLATFORM_ID));

  photos = input.required<AiPhoto[]>();
  maxPhotos = input(10);

  filesSelected = output<Event>();
  removePhoto = output<number>();
  apply = output<AiApplyPayload>();

  open = false;
  /** null = not checked yet */
  available: boolean | null = null;
  maxImages = 6;
  loading = false;
  elapsed = 0;
  error = '';
  draft: AiListingDraft | null = null;
  editTitle = '';
  editDescription = '';
  /** index into `categoryChoices` */
  selectedCategory = 0;
  /** photos the current draft was made from */
  private analysedSignature = '';
  private timer: ReturnType<typeof setInterval> | null = null;

  ngOnInit() {
    if (this.browser) this.checkStatus();
  }

  ngOnDestroy() {
    this.stopTimer();
  }

  checkStatus() {
    this.ai.status().subscribe({
      next: s => { this.available = s.available; this.maxImages = s.maxImages || 6; this.cdr.markForCheck(); },
      error: () => { this.available = false; this.cdr.markForCheck(); },
    });
  }

  toggle() {
    this.open = !this.open;
    if (this.open && this.available === false) this.checkStatus();
  }

  /** Only freshly selected photos can be analysed (they are still files in the browser). */
  get files(): File[] {
    return this.photos().filter(p => p.file).map(p => p.file!).slice(0, this.maxImages);
  }

  get tooManyPhotos(): boolean {
    return this.photos().filter(p => p.file).length > this.maxImages;
  }

  private signature(): string {
    return this.files.map(f => `${f.name}:${f.size}:${f.lastModified}`).join('|');
  }

  get photosChanged(): boolean {
    return !!this.draft && this.signature() !== this.analysedSignature;
  }

  get titleEdited(): boolean {
    return !!this.draft && this.editTitle.trim() !== this.draft.suggested_title;
  }

  get descriptionEdited(): boolean {
    return !!this.draft && this.editDescription.trim() !== this.draft.suggested_description;
  }

  get categoryChoices(): AiCategorySuggestion[] {
    return this.draft ? [this.draft.suggested_category, ...this.draft.alternative_categories] : [];
  }

  asCategory(value: string): Category {
    return value as Category;
  }

  get confidenceKey(): string {
    const c = this.draft?.confidence ?? 0;
    return c >= 0.75 ? 'ai.conf_high' : c >= 0.5 ? 'ai.conf_medium' : 'ai.conf_low';
  }

  get uncertain(): boolean {
    return !!this.draft && this.draft.confidence < 0.5;
  }

  /** Attributes belong to the main suggestion's subcategory; they are dropped if the user picks an alternative. */
  get attributeEntries(): { code: string; value: string }[] {
    if (!this.draft || this.selectedCategory !== 0) return [];
    return Object.entries(this.draft.attributes).map(([code, v]) => ({ code, value: this.attrValue(v) }));
  }

  /** Option codes (SELECT) have a translation, free text (brand, model) is shown as it is. */
  private attrValue(v: string | boolean): string {
    if (typeof v === 'boolean') return this.i18n.t(v ? 'common.yes' : 'common.no');
    const key = 'attrs.opts.' + v;
    const label = this.i18n.t(key);
    return label === key ? v : label;
  }

  get missingAttributes(): string[] {
    return this.draft && this.selectedCategory === 0 ? this.draft.missing_attributes : [];
  }

  analyse(force = false) {
    const files = this.files;
    if (!files.length || this.loading) return;
    const signature = this.signature();
    this.loading = true;
    this.error = '';
    this.startTimer();
    this.ai.draft(files, this.i18n.lang(), force).subscribe({
      next: async draft => {
        this.loading = false;
        this.stopTimer();
        this.available = true;
        await this.takeDraft(draft, signature);
        this.cdr.markForCheck();
      },
      error: (err: HttpErrorResponse) => {
        this.loading = false;
        this.stopTimer();
        const code = err.error?.code as string | undefined;
        if (code === 'AI_UNAVAILABLE' || err.status === 0) this.available = false;
        // Our API already answers in the portal language (limit reached, busy, unavailable, invalid file).
        this.error = (typeof err.error?.error === 'string' && err.status !== 0) ? err.error.error : this.i18n.t(err.status === 0 ? 'ai.unavailable' : 'ai.error_generic');
        this.cdr.markForCheck();
      },
    });
  }

  /** A new result never silently replaces texts the user edited in the preview. */
  private async takeDraft(draft: AiListingDraft, signature: string) {
    const keepTitle = this.titleEdited ? this.editTitle : null;
    const keepDescription = this.descriptionEdited ? this.editDescription : null;
    let replace = true;
    if (keepTitle !== null || keepDescription !== null) {
      replace = await this.dialog.confirm({
        message: this.i18n.t('ai.confirm_overwrite_edit'),
        confirmLabel: this.i18n.t('ai.replace'),
        cancelLabel: this.i18n.t('ai.keep_mine'),
      });
    }
    this.draft = draft;
    this.analysedSignature = signature;
    this.selectedCategory = 0;
    this.editTitle = !replace && keepTitle !== null ? keepTitle : draft.suggested_title;
    this.editDescription = !replace && keepDescription !== null ? keepDescription : draft.suggested_description;
  }

  applyDraft() {
    if (!this.draft) return;
    const choice = this.categoryChoices[this.selectedCategory] ?? this.draft.suggested_category;
    this.apply.emit({
      title: this.editTitle.trim(),
      description: this.editDescription.trim(),
      category: choice.category,
      subcategoryId: choice.subcategory_id,
      attributes: this.selectedCategory === 0 ? { ...this.draft.attributes } : {},
    });
    this.open = false;
  }

  private startTimer() {
    this.elapsed = 0;
    this.stopTimer();
    this.timer = setInterval(() => { this.elapsed++; this.cdr.markForCheck(); }, 1000);
  }

  private stopTimer() {
    if (this.timer) { clearInterval(this.timer); this.timer = null; }
  }
}
