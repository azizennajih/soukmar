import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { ToastService } from './toast.service';
import { DialogService } from './dialog.service';

describe('ToastService', () => {
  beforeEach(() => { TestBed.resetTestingModule(); vi.useFakeTimers(); });
  afterEach(() => vi.useRealTimers());

  it('shows a notice and removes it after its time', () => {
    const toast = TestBed.inject(ToastService);
    toast.success('Gespeichert');
    expect(toast.toasts().map(t => [t.kind, t.text])).toEqual([['success', 'Gespeichert']]);
    vi.advanceTimersByTime(5001);
    expect(toast.toasts()).toEqual([]);
  });

  it('keeps error notices on screen longer than other ones', () => {
    const toast = TestBed.inject(ToastService);
    toast.error('Fehler');
    vi.advanceTimersByTime(5001);
    expect(toast.toasts().length).toBe(1);
    vi.advanceTimersByTime(3500);
    expect(toast.toasts()).toEqual([]);
  });

  it('shows the same message once instead of stacking it', () => {
    const toast = TestBed.inject(ToastService);
    toast.error('Offline');
    toast.error('Offline');
    toast.error('Offline');
    expect(toast.toasts().length).toBe(1);
  });

  it('shows at most four notices at a time, newest last', () => {
    const toast = TestBed.inject(ToastService);
    for (let i = 1; i <= 6; i++) toast.info('Hinweis ' + i);
    expect(toast.toasts().map(t => t.text)).toEqual(['Hinweis 3', 'Hinweis 4', 'Hinweis 5', 'Hinweis 6']);
  });

  it('can be dismissed by hand', () => {
    const toast = TestBed.inject(ToastService);
    const id = toast.info('Hallo');
    toast.dismiss(id);
    expect(toast.toasts()).toEqual([]);
  });
});

describe('DialogService', () => {
  beforeEach(() => TestBed.resetTestingModule());

  it('confirm resolves true when confirmed and false when cancelled', async () => {
    const dialog = TestBed.inject(DialogService);
    const yes = dialog.confirm({ message: 'Wirklich löschen?', danger: true });
    expect(dialog.active()?.kind).toBe('confirm');
    expect(dialog.active()?.options.message).toBe('Wirklich löschen?');
    dialog.active()!.resolve(true);
    expect(await yes).toBe(true);
    expect(dialog.active()).toBeNull();

    const no = dialog.confirm({ message: 'Nochmal?' });
    dialog.active()!.resolve(false);
    expect(await no).toBe(false);
  });

  it('prompt resolves with the entered text, an empty string, or null when cancelled', async () => {
    const dialog = TestBed.inject(DialogService);
    const typed = dialog.prompt({ message: 'Grund?' });
    dialog.active()!.resolve('Doppelte Anzeige');
    expect(await typed).toBe('Doppelte Anzeige');

    const empty = dialog.prompt({ message: 'Grund?' });
    dialog.active()!.resolve('');
    expect(await empty).toBe('');

    const cancelled = dialog.prompt({ message: 'Grund?' });
    dialog.active()!.resolve(null);
    expect(await cancelled).toBeNull();
  });

  it('a new question cancels the one that is still open', async () => {
    const dialog = TestBed.inject(DialogService);
    const first = dialog.confirm({ message: 'Erste?' });
    const firstPrompt = dialog.prompt({ message: 'Zweite?' });
    expect(await first).toBe(false);
    expect(dialog.active()?.options.message).toBe('Zweite?');
    dialog.active()!.resolve(null);
    expect(await firstPrompt).toBeNull();
  });
});
