import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { I18nService } from '../../services/i18n.service';

@Component({
  selector: 'app-premium',
  imports: [CommonModule, RouterLink, TranslatePipe],
  templateUrl: './premium.component.html',
  styleUrl: './premium.component.scss'
})
export class PremiumComponent {
  i18n = inject(I18nService);

  get plans() {
    const t = (k: string) => this.i18n.t(k);
    return [
      {
        name: t('premium.plan_free'),
        price: '0',
        period: t('premium.plan_free_period'),
        color: '#64748b',
        popular: false,
        features: [
          t('premium.feat_free_1'), t('premium.feat_free_2'),
          t('premium.feat_free_3'), t('premium.feat_free_4'),
        ],
        cta: t('premium.cta_free'),
        ctaLink: '/deposer-annonce',
        ghost: true,
      },
      {
        name: 'Pro',
        price: '99',
        period: t('premium.plan_pro_period'),
        color: '#e63946',
        popular: true,
        features: [
          t('premium.feat_pro_1'), t('premium.feat_pro_2'),
          t('premium.feat_pro_3'), t('premium.feat_pro_4'),
          t('premium.feat_pro_5'),
        ],
        cta: t('premium.cta_pro'),
        ctaLink: '/auth/register',
        ghost: false,
      },
      {
        name: 'Business',
        price: '299',
        period: t('premium.plan_biz_period'),
        color: '#7e22ce',
        popular: false,
        features: [
          t('premium.feat_biz_1'), t('premium.feat_biz_2'),
          t('premium.feat_biz_3'), t('premium.feat_biz_4'),
          t('premium.feat_biz_5'), t('premium.feat_biz_6'),
        ],
        cta: t('premium.cta_biz'),
        ctaLink: '/auth/register',
        ghost: true,
      },
    ];
  }

  get features() {
    const t = (k: string) => this.i18n.t(k);
    return [
      { icon: '👁', title: t('premium.f1_title'), desc: t('premium.f1_desc') },
      { icon: '⚡', title: t('premium.f2_title'), desc: t('premium.f2_desc') },
      { icon: '📊', title: t('premium.f3_title'), desc: t('premium.f3_desc') },
      { icon: '🛡️', title: t('premium.f4_title'), desc: t('premium.f4_desc') },
    ];
  }

  get faqs() {
    const t = (k: string) => this.i18n.t(k);
    return [
      { q: t('premium.q1'), a: t('premium.a1') },
      { q: t('premium.q2'), a: t('premium.a2') },
      { q: t('premium.q3'), a: t('premium.a3') },
      { q: t('premium.q4'), a: t('premium.a4') },
    ];
  }
}
