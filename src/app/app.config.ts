import { ApplicationConfig, provideAppInitializer, inject, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection, isDevMode } from '@angular/core';
import { I18nService } from './services/i18n.service';
import { provideRouter, withInMemoryScrolling, TitleStrategy } from '@angular/router';
import { LocalizedTitleStrategy } from './services/localized-title.strategy';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { appReadyInterceptor } from './services/app-ready.service';
import { langInterceptor } from './services/lang.interceptor';
import { provideClientHydration } from '@angular/platform-browser';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    // The page's dictionary is loaded before the first render (the other 10 languages are not downloaded at all).
    provideAppInitializer(() => inject(I18nService).initialLoad()),
    provideRouter(routes, withInMemoryScrolling({ scrollPositionRestoration: 'top', anchorScrolling: 'enabled' })),
    { provide: TitleStrategy, useClass: LocalizedTitleStrategy },
    provideHttpClient(withFetch(), withInterceptors([appReadyInterceptor, langInterceptor])),
    // Only in production: the Vite dev-server's SSR + HMR combo can leave a
    // component's hydrated TView out of sync with its post-edit template
    // (surfaces as "ASSERTION ERROR: Unexpected value of the `ssrId`" in the
    // console), after which markForCheck()-driven updates silently stop
    // reaching the DOM — model state is correct, the page just never
    // re-renders. A `ng build` has no HMR, so this can't happen there.
    ...(isDevMode() ? [] : [provideClientHydration()]),
  ]
};
