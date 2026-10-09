import { Injectable, signal } from '@angular/core';

export interface ConfirmOptions {
  message: string;
  title?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Destructive action (delete, block, ...): shown with a warning mark. */
  danger?: boolean;
}

export interface PromptOptions extends ConfirmOptions {
  placeholder?: string;
}

export interface ActiveDialog {
  kind: 'confirm' | 'prompt';
  options: ConfirmOptions & PromptOptions;
  /** true/false for confirm(), the entered text or null for prompt(). */
  resolve: (value: boolean | string | null) => void;
}

/** In-page question dialogs — the replacement for window.confirm() and window.prompt().
 * Rendered by <app-dialog-host> (mounted once in the app root). Both calls return a promise:
 *   if (!(await dialog.confirm({ message, danger: true }))) return;
 *   const note = await dialog.prompt({ message });   // null = cancelled, '' = confirmed without text */
@Injectable({ providedIn: 'root' })
export class DialogService {
  readonly active = signal<ActiveDialog | null>(null);

  confirm(options: ConfirmOptions): Promise<boolean> {
    return this.open('confirm', options) as Promise<boolean>;
  }

  prompt(options: PromptOptions): Promise<string | null> {
    return this.open('prompt', options) as Promise<string | null>;
  }

  private open(kind: ActiveDialog['kind'], options: PromptOptions): Promise<boolean | string | null> {
    // A new question replaces an open one (the old one counts as cancelled).
    this.active()?.resolve(this.active()!.kind === 'confirm' ? false : null);
    return new Promise(resolve => {
      this.active.set({
        kind,
        options,
        resolve: value => { this.active.set(null); resolve(value); },
      });
    });
  }

  /** Called by the dialog host. */
  answer(value: boolean | string | null) {
    this.active()?.resolve(value);
  }
}
