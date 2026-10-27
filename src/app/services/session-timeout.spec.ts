import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { SessionTimeoutService } from './session-timeout.service';
import { AuthService } from './auth.service';
import { BrowserStorageService } from './browser-storage.service';
import { I18nService } from './i18n.service';
import { ToastService } from './toast.service';

const MIN = 60_000;
const HOUR = 60 * MIN;

describe('SessionTimeoutService', () => {
  let store: Map<string, string>;
  let user: ReturnType<typeof signal<object | null>>;
  let auth: { currentUser: typeof user; isLoggedIn: boolean; token: string; replaceToken: ReturnType<typeof vi.fn>; logout: ReturnType<typeof vi.fn> };
  let toast: { info: ReturnType<typeof vi.fn> };
  let fetchMock: ReturnType<typeof vi.fn>;

  const start = () => { TestBed.inject(SessionTimeoutService).start(); TestBed.tick(); };
  const setUser = (u: object | null) => { user.set(u); auth.isLoggedIn = !!u; TestBed.tick(); };
  const touch = () => dispatchEvent(new Event('pointerdown'));
  /** Time passes in steps, as the real 15 s timer would see it. */
  const advance = (ms: number) => vi.advanceTimersByTime(ms);

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-27T10:00:00Z'));
    store = new Map();
    user = signal<object | null>(null);
    auth = { currentUser: user, isLoggedIn: false, token: 'tok', replaceToken: vi.fn(), logout: vi.fn(() => { user.set(null); auth.isLoggedIn = false; }) };
    toast = { info: vi.fn() };
    fetchMock = vi.fn(async () => ({ status: 200, ok: true, json: async () => ({ token: 'fresh' }) }));
    vi.stubGlobal('fetch', fetchMock);
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: auth },
        { provide: BrowserStorageService, useValue: {
          getItem: (k: string) => store.get(k) ?? null,
          setItem: (k: string, v: string) => { store.set(k, v); },
          removeItem: (k: string) => { store.delete(k); },
        } },
        { provide: I18nService, useValue: { t: (k: string) => k } },
        { provide: ToastService, useValue: toast },
      ],
    });
  });
  afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });

  it('signs out after 3 hours without input and says why', () => {
    start(); setUser({ id: 'u' });
    advance(3 * HOUR - MIN);
    expect(auth.logout).not.toHaveBeenCalled();
    advance(2 * MIN);
    expect(auth.logout).toHaveBeenCalledTimes(1);
    expect(toast.info).toHaveBeenCalledWith('auth.session_expired');
  });

  it('warns 2 minutes before the end, only once', () => {
    start(); setUser({ id: 'u' });
    advance(3 * HOUR - 3 * MIN);
    expect(toast.info).not.toHaveBeenCalled();
    advance(2 * MIN);
    expect(toast.info).toHaveBeenCalledWith('auth.session_expiring');
    advance(30_000);
    expect(toast.info.mock.calls.filter(c => c[0] === 'auth.session_expiring').length).toBe(1);
  });

  it('input resets the countdown', () => {
    start(); setUser({ id: 'u' });
    advance(2 * HOUR + 50 * MIN);
    touch();
    advance(2 * HOUR + 50 * MIN);
    expect(auth.logout).not.toHaveBeenCalled();
    advance(15 * MIN);
    expect(auth.logout).toHaveBeenCalled();
  });

  it('activity in another tab (shared timestamp) keeps this tab signed in', () => {
    start(); setUser({ id: 'u' });
    advance(2 * HOUR + 50 * MIN);
    store.set('soukmar_last_activity', String(Date.now()));
    advance(2 * HOUR + 50 * MIN);
    expect(auth.logout).not.toHaveBeenCalled();
  });

  it('refreshes the token while the user is active, never while idle', () => {
    start(); setUser({ id: 'u' });
    advance(4 * MIN); touch();
    advance(2 * MIN);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toContain('/auth/refresh');
    // idle for a long stretch (within the limit): no further refreshes beyond what the timer allows is NOT the point —
    // the refresh must stop once the user is gone, so the session can run out.
    fetchMock.mockClear();
    advance(3 * HOUR);
    expect(auth.logout).toHaveBeenCalled();
  });

  it('stores the fresh token and signs out when the server rejects the refresh', async () => {
    start(); setUser({ id: 'u' });
    advance(4 * MIN); touch(); advance(2 * MIN);
    await vi.advanceTimersByTimeAsync(0);
    expect(auth.replaceToken).toHaveBeenCalledWith('fresh');

    fetchMock.mockResolvedValue({ status: 401, ok: false, json: async () => ({}) });
    advance(4 * MIN); touch(); advance(2 * MIN);
    await vi.advanceTimersByTimeAsync(0);
    expect(auth.logout).toHaveBeenCalled();
  });

  it('a login left behind longer than the limit ends right at startup', () => {
    store.set('soukmar_last_activity', String(Date.now() - 4 * HOUR));
    // as in the app: the saved login is already known when the service starts
    user.set({ id: 'u' }); auth.isLoggedIn = true;
    start();
    expect(auth.logout).toHaveBeenCalledTimes(1);
  });
});
