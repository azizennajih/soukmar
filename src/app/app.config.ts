import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection, isDevMode } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes, withInMemoryScrolling({ scrollPositionRestoration: 'top', anchorScrolling: 'enabled' })),
    provideHttpClient(withFetch()),
    // Only in production: the Vite dev-server's SSR + HMR combo can leave a
    // component's hydrated TView out of sync with its post-edit template
    // (surfaces as "ASSERTION ERROR: Unexpected value of the `ssrId`" in the
    // console), after which markForCheck()-driven updates silently stop
    // reaching the DOM — model state is correct, the page just never
    // re-renders. A `ng build` has no HMR, so this can't happen there.
    ...(isDevMode() ? [] : [provideClientHydration()]),
  ]
};
