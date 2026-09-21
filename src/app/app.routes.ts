import { Router, Routes } from '@angular/router';
import { inject } from '@angular/core';
import { adminGuard } from './guards/admin.guard';
import { LocaleShellComponent } from './pages/locale-shell/locale-shell.component';
import { I18nService } from './services/i18n.service';
import { localeUrlMatcher } from './services/locale-routing';

/** The full app, unchanged, now living under a `localeUrlMatcher`-matched
 * `:lang` segment (`/fr/annonces`, `/ar/annonces/abc123`, ...) instead of
 * at the root. See LocaleShellComponent for how the segment drives
 * I18nService, and locale-routing.ts for why a custom matcher is used
 * instead of a plain `path: ':lang'` param (it must never swallow a real
 * route segment like `/annonces` on a bare, unprefixed URL). */
const localizedRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'annonces',
    loadComponent: () => import('./pages/annonces/annonces.component').then(m => m.AnnoncesComponent)
  },
  {
    path: 'annonces/:id',
    loadComponent: () => import('./pages/annonce-detail/annonce-detail.component').then(m => m.AnnonceDetailComponent)
  },
  {
    path: 'recherche-image',
    loadComponent: () => import('./pages/image-search/image-search.component').then(m => m.ImageSearchComponent)
  },
  {
    path: 'deposer-annonce',
    loadComponent: () => import('./pages/deposer-annonce/deposer-annonce.component').then(m => m.DeposerAnnonceComponent)
  },
  {
    path: 'deposer-annonce/:id',
    loadComponent: () => import('./pages/deposer-annonce/deposer-annonce.component').then(m => m.DeposerAnnonceComponent)
  },
  {
    path: 'auth/login',
    loadComponent: () => import('./pages/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'auth/register',
    loadComponent: () => import('./pages/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'auth/forgot-password',
    loadComponent: () => import('./pages/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent)
  },
  {
    path: 'auth/reset-password',
    loadComponent: () => import('./pages/auth/reset-password/reset-password.component').then(m => m.ResetPasswordComponent)
  },
  {
    path: 'mes-annonces',
    loadComponent: () => import('./pages/mes-annonces/mes-annonces.component').then(m => m.MesAnnoncesComponent)
  },
  {
    path: 'mes-favoris',
    loadComponent: () => import('./pages/mes-favoris/mes-favoris.component').then(m => m.MesFavorisComponent)
  },
  {
    path: 'chat',
    loadComponent: () => import('./pages/chat/chat.component').then(m => m.ChatComponent)
  },
  {
    path: 'notifications',
    loadComponent: () => import('./pages/notifications/notifications.component').then(m => m.NotificationsComponent)
  },
  {
    path: 'vendeur/:id',
    loadComponent: () => import('./pages/seller-profile/seller-profile.component').then(m => m.SellerProfileComponent)
  },
  {
    path: 'recherches-sauvegardees',
    loadComponent: () => import('./pages/saved-searches/saved-searches.component').then(m => m.SavedSearchesComponent)
  },
  {
    path: 'profil',
    loadComponent: () => import('./pages/profil/profil.component').then(m => m.ProfilComponent)
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () => import('./pages/admin/admin.component').then(m => m.AdminComponent)
  },
  {
    path: 'premium',
    loadComponent: () => import('./pages/premium/premium.component').then(m => m.PremiumComponent)
  },
  {
    path: 'parametres',
    loadComponent: () => import('./pages/parametres/parametres.component').then(m => m.ParametresComponent)
  },
  {
    path: 'mentions-legales',
    loadComponent: () => import('./pages/mentions-legales/mentions-legales.component').then(m => m.MentionsLegalesComponent)
  },
  {
    path: 'aide',
    loadComponent: () => import('./pages/aide/aide.component').then(m => m.AideComponent)
  },
  {
    path: 'supprimer-compte',
    loadComponent: () => import('./pages/supprimer-compte/supprimer-compte.component').then(m => m.SupprimerCompteComponent)
  },
  {
    path: 'politique-confidentialite',
    data: { titleKey: 'legal.privacy_title', namespace: 'legal.privacy', sectionCount: 11 },
    loadComponent: () => import('./pages/legal-page/legal-page.component').then(m => m.LegalPageComponent)
  },
  {
    path: 'conditions-utilisation',
    data: { titleKey: 'legal.terms_title', namespace: 'legal.terms', sectionCount: 14 },
    loadComponent: () => import('./pages/legal-page/legal-page.component').then(m => m.LegalPageComponent)
  },
  {
    path: 'droit-retractation',
    data: { titleKey: 'legal.withdrawal_title', namespace: 'legal.withdrawal', sectionCount: 6 },
    loadComponent: () => import('./pages/legal-page/legal-page.component').then(m => m.LegalPageComponent)
  },
  {
    // Unknown path under a *valid* language prefix (e.g. a dead link,
    // or the harmless double-redirect that can happen for a bare URL
    // whose path also isn't a real route) — back to that language's home.
    path: '**',
    redirectTo: ''
  }
];

export const routes: Routes = [
  {
    matcher: localeUrlMatcher,
    component: LocaleShellComponent,
    children: localizedRoutes
  },
  {
    // Anything that didn't match a `/xx/...` language prefix above: a bare
    // URL (`/`, `/annonces/abc123`) or a stray unknown top-level path.
    // Redirects to the same path under the visitor's detected language,
    // preserving query params. Angular's SSR renderer turns a redirect hit
    // during the initial navigation into a real HTTP redirect, so this
    // works for crawlers hitting bare URLs server-side too, not just for
    // in-app client navigation.
    path: '**',
    redirectTo: data => {
      const router = inject(Router);
      const i18n = inject(I18nService);
      const lang = i18n.lang();
      const segments = data.url.map(s => s.path);
      return router.createUrlTree([`/${lang}`, ...segments], {
        queryParams: data.queryParams,
        fragment: data.fragment ?? undefined,
      });
    }
  }
];
