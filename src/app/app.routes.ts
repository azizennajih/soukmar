import { Routes } from '@angular/router';

export const routes: Routes = [
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
    path: 'deposer-annonce',
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
    path: 'mes-annonces',
    loadComponent: () => import('./pages/mes-annonces/mes-annonces.component').then(m => m.MesAnnoncesComponent)
  },
  {
    path: 'admin',
    loadComponent: () => import('./pages/admin/admin.component').then(m => m.AdminComponent)
  },
  {
    path: 'premium',
    loadComponent: () => import('./pages/premium/premium.component').then(m => m.PremiumComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
