import { ChangeDetectorRef, Component, ElementRef, OnInit, PLATFORM_ID, ViewChild, inject, output } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { I18nService } from '../../services/i18n.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

declare global {
  interface Window {
    google?: { accounts: { id: {
      initialize: (o: Record<string, unknown>) => void;
      renderButton: (el: HTMLElement, o: Record<string, unknown>) => void;
    } } };
    FB?: {
      init: (o: Record<string, unknown>) => void;
      login: (cb: (r: { authResponse?: { accessToken: string } }) => void, o: Record<string, unknown>) => void;
    };
  }
}

function loadScript(id: string, src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.getElementById(id)) { resolve(); return; }
    const s = document.createElement('script');
    s.id = id; s.src = src; s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(src));
    document.head.appendChild(s);
  });
}

/** "Continue with Google / Facebook" buttons. Shows only the providers the server has configured and renders
 * nothing when there are none. Emits (signedIn) once the server accepted the provider's token. Instagram users
 * sign in through Facebook (Instagram has no login API of its own any more). */
@Component({
  selector: 'app-social-login',
  imports: [TranslatePipe],
  template: `
    @if (google || facebook) {
      <div class="social__sep"><span>{{ 'auth.social_or' | T }}</span></div>
      @if (error) { <div class="auth-error">{{ error }}</div> }
      <div class="social__buttons">
        @if (google) { <div #googleBtn class="social__google"></div> }
        @if (facebook) {
          <button type="button" class="social__fb" [disabled]="busy" (click)="facebookLogin()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M24 12a12 12 0 1 0-13.9 11.9v-8.4H7.1V12h3V9.4c0-3 1.8-4.7 4.5-4.7 1.3 0 2.7.2 2.7.2v3h-1.5c-1.5 0-2 .9-2 1.9V12h3.4l-.5 3.5h-2.9v8.4A12 12 0 0 0 24 12z"/></svg>
            {{ 'auth.social_facebook' | T }}
          </button>
        }
      </div>
    }
  `,
  styleUrl: './social-login.component.scss',
})
export class SocialLoginComponent implements OnInit {
  private auth = inject(AuthService);
  private i18n = inject(I18nService);
  private cdr = inject(ChangeDetectorRef);
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private googleEl?: HTMLElement;
  private googleReady = false;

  signedIn = output<void>();
  google = '';
  facebook = '';
  busy = false;
  error = '';

  @ViewChild('googleBtn') set googleBtn(el: ElementRef<HTMLElement> | undefined) {
    this.googleEl = el?.nativeElement;
    this.renderGoogle();
  }

  async ngOnInit() {
    if (!this.isBrowser) return;
    const p = await this.auth.socialProviders();
    this.google = p.google ?? '';
    this.facebook = p.facebook ?? '';
    this.cdr.markForCheck();
    if (this.google) {
      await loadScript('google-gsi', 'https://accounts.google.com/gsi/client').catch(() => {});
      this.googleReady = true;
      this.renderGoogle();
    }
    if (this.facebook) {
      await loadScript('facebook-sdk', 'https://connect.facebook.net/en_US/sdk.js').catch(() => {});
      window.FB?.init({ appId: this.facebook, version: 'v21.0', cookie: false, xfbml: false });
    }
  }

  private renderGoogle() {
    const el = this.googleEl;
    if (!el || !this.googleReady || !window.google || el.childElementCount) return;
    window.google.accounts.id.initialize({ client_id: this.google, callback: (r: { credential: string }) => this.finish('google', r.credential) });
    window.google.accounts.id.renderButton(el, { theme: 'outline', size: 'large', width: 320, text: 'continue_with', locale: this.i18n.lang() });
  }

  facebookLogin() {
    if (!window.FB || this.busy) return;
    window.FB.login(r => { if (r.authResponse) this.finish('facebook', r.authResponse.accessToken); }, { scope: 'email,public_profile' });
  }

  private async finish(provider: 'google' | 'facebook', token: string) {
    this.busy = true;
    this.error = '';
    const res = await this.auth.loginSocial(provider, token);
    this.busy = false;
    if (res.ok) this.signedIn.emit();
    else this.error = res.error ?? this.i18n.t('auth.social_error');
    this.cdr.markForCheck();
  }
}
