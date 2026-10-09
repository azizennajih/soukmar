import { Component, ElementRef, HostListener, ViewChild, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DialogService } from '../../services/dialog.service';
import { IconComponent } from '../icon/icon.component';
import { TranslatePipe } from '../../pipes/translate.pipe';

/** Shows the question dialogs of DialogService (confirm / prompt). Mounted once in the app root. */
@Component({
  selector: 'app-dialog-host',
  imports: [FormsModule, IconComponent, TranslatePipe],
  template: `
    @if (dialogService.active(); as dlg) {
      <div class="dlg-backdrop" (mousedown)="onBackdrop($event)">
        <div class="dlg" role="dialog" aria-modal="true" aria-labelledby="dlg-message">
          @if (dlg.options.danger) {
            <div class="dlg__mark"><app-icon name="alert-triangle" [size]="22" /></div>
          }
          @if (dlg.options.title) { <h2 class="dlg__title">{{ dlg.options.title }}</h2> }
          <p class="dlg__message" id="dlg-message">{{ dlg.options.message }}</p>

          @if (dlg.kind === 'prompt') {
            <textarea
              #field class="dlg__input" rows="3" [placeholder]="dlg.options.placeholder ?? ''"
              [(ngModel)]="text" (keydown.control.enter)="submit()" (keydown.meta.enter)="submit()"
            ></textarea>
          }

          <div class="dlg__actions">
            <button type="button" class="btn-outline" (click)="cancel()">{{ dlg.options.cancelLabel ?? ('common.cancel' | T) }}</button>
            <button #primary type="button" class="btn-primary" (click)="submit()">{{ dlg.options.confirmLabel ?? ('common.confirm' | T) }}</button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .dlg-backdrop {
      position: fixed; inset: 0; z-index: 2500; display: flex; align-items: center; justify-content: center;
      padding: 1rem; background: rgba(15, 23, 42, .5); animation: dlg-fade .15s ease;
    }
    .dlg {
      width: min(100%, 26rem); padding: 1.5rem; background: #fff; border-radius: 1.25rem;
      box-shadow: 0 24px 60px rgba(15, 23, 42, .3); animation: dlg-pop .18s ease;
    }
    .dlg__mark {
      width: 2.75rem; height: 2.75rem; margin-bottom: .9rem; border-radius: 50%;
      display: flex; align-items: center; justify-content: center; background: #fef1f2; color: #e63946;
    }
    .dlg__title { margin: 0 0 .4rem; font-size: 1.1rem; font-weight: 800; color: #0f172a; }
    .dlg__message { margin: 0 0 1.25rem; font-size: .95rem; line-height: 1.5; color: #334155; white-space: pre-line; overflow-wrap: anywhere; }
    .dlg__input {
      display: block; width: 100%; margin: -.4rem 0 1.25rem; padding: .7rem .8rem; resize: vertical; min-height: 5rem;
      font: inherit; font-size: .9rem; color: #0f172a; border: 1.5px solid #e2e8f0; border-radius: .75rem;
      &:focus { outline: none; border-color: #e63946; box-shadow: 0 0 0 3px #fef1f2; }
    }
    .dlg__actions { display: flex; justify-content: flex-end; gap: .6rem; flex-wrap: wrap; }
    .dlg__actions button { min-width: 6.5rem; }
    @keyframes dlg-fade { from { opacity: 0; } to { opacity: 1; } }
    @keyframes dlg-pop { from { opacity: 0; transform: translateY(8px) scale(.98); } to { opacity: 1; transform: none; } }
    @media (prefers-reduced-motion: reduce) { .dlg-backdrop, .dlg { animation: none; } }
  `],
})
export class DialogHostComponent {
  dialogService = inject(DialogService);
  text = '';

  /** The field (prompt) or the confirm button gets the focus as soon as the dialog appears. */
  @ViewChild('field') set field(el: ElementRef<HTMLElement> | undefined) { this.focusSoon(el); }
  @ViewChild('primary') set primary(el: ElementRef<HTMLElement> | undefined) {
    if (!this.dialogService.active() || this.dialogService.active()!.kind === 'confirm') this.focusSoon(el);
  }

  private focusSoon(el: ElementRef<HTMLElement> | undefined) {
    if (!el) return;
    this.text = '';
    setTimeout(() => el.nativeElement.focus());
  }

  submit() {
    const dlg = this.dialogService.active();
    if (!dlg) return;
    dlg.resolve(dlg.kind === 'prompt' ? this.text.trim() : true);
  }

  cancel() {
    const dlg = this.dialogService.active();
    if (!dlg) return;
    dlg.resolve(dlg.kind === 'prompt' ? null : false);
  }

  onBackdrop(e: MouseEvent) {
    if (e.target === e.currentTarget) this.cancel();
  }

  @HostListener('document:keydown.escape')
  onEscape() { this.cancel(); }
}
