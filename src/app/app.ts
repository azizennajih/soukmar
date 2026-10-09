import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { CookieConsentBannerComponent } from './components/cookie-consent-banner/cookie-consent-banner.component';
import { AppReadyService } from './services/app-ready.service';
import { VisitPingService } from './services/visit-ping.service';
import { ToastHostComponent } from './components/toast-host/toast-host.component';
import { DialogHostComponent } from './components/dialog-host/dialog-host.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, FooterComponent, CookieConsentBannerComponent, ToastHostComponent, DialogHostComponent],
  template: `
    <app-navbar />
    <main class="main-content">
      <router-outlet />
    </main>
    <div class="footer-slot" [class.footer-slot--pending]="!appReady.ready()">
      <app-footer />
    </div>
    <app-cookie-consent-banner />
    <app-toast-host />
    <app-dialog-host />
  `,
  styles: [`
    :host { display: flex; flex-direction: column; min-height: 100vh; }
    .main-content { flex: 1; }
    .footer-slot { transition: opacity .25s ease; }
    .footer-slot--pending { opacity: 0; visibility: hidden; }
  `]
})
export class App {
  appReady = inject(AppReadyService);

  constructor() {
    inject(VisitPingService).start();
  }
}
