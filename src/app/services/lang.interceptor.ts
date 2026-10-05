import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { I18nService } from './i18n.service';
import { apiBase } from '../config/api.config';

/** Tells our own API which language the UI is in, so error and status
 * messages come back translated (the browser's own Accept-Language would be
 * the system language, not the language picked on the site). Never sent to
 * third-party hosts. */
export const langInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(apiBase())) return next(req);
  return next(req.clone({ setHeaders: { 'Accept-Language': inject(I18nService).lang() } }));
};
