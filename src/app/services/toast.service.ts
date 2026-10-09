import { Injectable, signal } from '@angular/core';

export type ToastKind = 'success' | 'error' | 'info';

export interface Toast {
  id: number;
  kind: ToastKind;
  text: string;
}

/** Small, non-blocking notices at the top of the screen — the replacement for window.alert().
 * Rendered by <app-toast-host> (mounted once in the app root). */
@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly toasts = signal<Toast[]>([]);
  private seq = 0;
  private timers = new Map<number, ReturnType<typeof setTimeout>>();

  show(text: string, kind: ToastKind = 'info', durationMs = kind === 'error' ? 8000 : 5000): number {
    const id = ++this.seq;
    // Same message twice in a row (e.g. a button hammered while offline) shows once, not as a stack.
    const existing = this.toasts().find(t => t.text === text && t.kind === kind);
    if (existing) { this.restartTimer(existing.id, durationMs); return existing.id; }
    this.toasts.update(list => [...list.slice(-3), { id, kind, text }]); // at most 4 at a time
    this.restartTimer(id, durationMs);
    return id;
  }

  success(text: string) { return this.show(text, 'success'); }
  error(text: string) { return this.show(text, 'error'); }
  info(text: string) { return this.show(text, 'info'); }

  dismiss(id: number) {
    clearTimeout(this.timers.get(id));
    this.timers.delete(id);
    this.toasts.update(list => list.filter(t => t.id !== id));
  }

  private restartTimer(id: number, durationMs: number) {
    clearTimeout(this.timers.get(id));
    if (durationMs > 0) this.timers.set(id, setTimeout(() => this.dismiss(id), durationMs));
  }
}
