import { Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { TURNSTILE_SITE_KEY } from '../../config/turnstile.config';

declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, options: Record<string, unknown>) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

const SCRIPT_ID = 'cf-turnstile-script';
const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js';

/** Cloudflare Turnstile "prove you're human" widget. Emits a token on
 * (verified) once solved — pass that along as `captchaToken` on the request
 * it's guarding (register, create listing). Renders nothing and emits a
 * fixed dev token immediately when no site key is configured yet, so local
 * development isn't blocked on setting up a Cloudflare account. */
@Component({
  selector: 'app-turnstile',
  template: `<div #container></div>`,
})
export class TurnstileComponent implements OnInit, OnDestroy {
  @ViewChild('container', { static: true }) container!: ElementRef<HTMLElement>;
  @Output() verified = new EventEmitter<string>();

  private widgetId: string | null = null;

  ngOnInit() {
    if (!TURNSTILE_SITE_KEY) {
      // Dev mode: no site key configured yet — the backend accepts this
      // fixed token as long as TURNSTILE_SECRET_KEY is also unset.
      this.verified.emit('dev-bypass');
      return;
    }
    this.loadScript().then(() => this.render());
  }

  ngOnDestroy() {
    if (this.widgetId && window.turnstile) window.turnstile.remove(this.widgetId);
  }

  private render() {
    if (!window.turnstile) return;
    this.widgetId = window.turnstile.render(this.container.nativeElement, {
      sitekey: TURNSTILE_SITE_KEY,
      callback: (token: string) => this.verified.emit(token),
    });
  }

  private loadScript(): Promise<void> {
    if (window.turnstile) return Promise.resolve();
    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      return new Promise(resolve => existing.addEventListener('load', () => resolve()));
    }
    return new Promise(resolve => {
      const script = document.createElement('script');
      script.id = SCRIPT_ID;
      script.src = SCRIPT_SRC;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      document.head.appendChild(script);
    });
  }
}
