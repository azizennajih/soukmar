import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-premium',
  imports: [CommonModule, RouterLink],
  templateUrl: './premium.component.html',
  styleUrl: './premium.component.scss'
})
export class PremiumComponent {
  plans = [
    {
      name: 'Gratuit',
      price: '0',
      period: 'toujours',
      color: '#64748b',
      popular: false,
      features: [
        '1 annonce active',
        'Visibilité standard',
        'Messagerie interne',
        'Profil basique',
      ],
      cta: 'Commencer',
      ctaLink: '/deposer-annonce',
      ghost: true,
    },
    {
      name: 'Pro',
      price: '99',
      period: 'mois',
      color: '#e63946',
      popular: true,
      features: [
        '10 annonces actives',
        'Mise en avant 7 jours',
        'Badge Pro sur le profil',
        'Statistiques détaillées',
        'Support prioritaire',
      ],
      cta: 'Commencer le Pro',
      ctaLink: '/auth/register',
      ghost: false,
    },
    {
      name: 'Business',
      price: '299',
      period: 'mois',
      color: '#7e22ce',
      popular: false,
      features: [
        'Annonces illimitées',
        'Mise en avant permanente',
        'Page entreprise dédiée',
        'Bandeau publicitaire',
        'Statistiques avancées',
        'Account manager dédié',
      ],
      cta: 'Contacter les ventes',
      ctaLink: '/auth/register',
      ghost: true,
    },
  ];
}
