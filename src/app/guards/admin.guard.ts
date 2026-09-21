import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { I18nService } from '../services/i18n.service';

export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const i18n = inject(I18nService);
  const user = auth.currentUser();
  if (user?.role === 'ADMIN' || user?.role === 'MODERATOR') return true;
  router.navigate(i18n.withLang(['/']));
  return false;
};
