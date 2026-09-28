import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { CookieConsentBannerComponent } from './components/cookie-consent-banner/cookie-consent-banner.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, FooterComponent, CookieConsentBannerComponent],
  template: `
    <app-navbar />
    <main class="main-content">
      <router-outlet />
    </main>
    <app-footer />
    <app-cookie-consent-banner />
  `,
  styles: [`
    :host { display: flex; flex-direction: column; min-height: 100vh; }
    .main-content { flex: 1; }
  `]
})
export class App {}
