import { HttpInterceptorFn } from '@angular/common/http';
import { apiBase } from '../config/api.config';

/** The login lives in an HttpOnly cookie that no script can read, so requests to our own API must ask the browser
 * to send it (also when the API is on another port during development). Other hosts never get it. */
export const credentialsInterceptor: HttpInterceptorFn = (req, next) =>
  req.url.startsWith(apiBase()) ? next(req.clone({ withCredentials: true })) : next(req);
