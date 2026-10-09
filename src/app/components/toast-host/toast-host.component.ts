import { Component, inject } from '@angular/core';
import { ToastService } from '../../services/toast.service';
import { I18nService } from '../../services/i18n.service';
import { IconComponent } from '../icon/icon.component';
import { TranslatePipe } from '../../pipes/translate.pipe';

/** Shows the notices of ToastService at the top of the screen. Mounted once in the app root. */
@Component({
  selector: 'app-toast-host',
  imports: [IconComponent, TranslatePipe],
  template: `
    <div class="toasts" aria-live="polite">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="toast" [class]="'toast toast--' + toast.kind" [attr.role]="toast.kind === 'error' ? 'alert' : 'status'">
          <app-icon [name]="toast.kind === 'success' ? 'check-circle' : toast.kind === 'error' ? 'alert-triangle' : 'bell'" [size]="17" />
          <span class="toast__text">{{ toast.text }}</span>
          <button type="button" class="toast__close" (click)="toastService.dismiss(toast.id)" [attr.aria-label]="'common.close' | T">×</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toasts {
      position: fixed; top: 1rem; left: 50%; transform: translateX(-50%); z-index: 3000;
      display: flex; flex-direction: column; gap: .5rem; width: min(94vw, 26rem); pointer-events: none;
    }
    .toast {
      pointer-events: auto; display: flex; align-items: flex-start; gap: .65rem;
      padding: .8rem .9rem .8rem 1rem; background: #fff; color: #0f172a;
      border: 1.5px solid #e2e8f0; border-left-width: 4px; border-radius: .9rem;
      box-shadow: 0 12px 32px rgba(15, 23, 42, .18); font-size: .9rem; font-weight: 600; line-height: 1.4;
      animation: toast-in .2s ease;
    }
    .toast app-icon { flex-shrink: 0; margin-top: .1rem; }
    .toast--success { border-left-color: #16a34a; app-icon { color: #16a34a; } }
    .toast--error   { border-left-color: #e63946; app-icon { color: #e63946; } }
    .toast--info    { border-left-color: #1d4ed8; app-icon { color: #1d4ed8; } }
    .toast__text { flex: 1; min-width: 0; overflow-wrap: anywhere; }
    .toast__close {
      flex-shrink: 0; padding: 0 .3rem; background: none; border: none; cursor: pointer;
      font-size: 1.3rem; line-height: 1; color: #94a3b8;
      &:hover { color: #475569; }
    }
    @keyframes toast-in { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: none; } }
    @media (prefers-reduced-motion: reduce) { .toast { animation: none; } }
  `],
})
export class ToastHostComponent {
  toastService = inject(ToastService);
  i18n = inject(I18nService);
}
