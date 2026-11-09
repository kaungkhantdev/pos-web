import { HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { API_URL } from '../api/api.config';
import { catchError, switchMap, throwError } from 'rxjs';
import { ApiError, isUnauthorized } from '../api/api.types';

/** Adds the bearer token. On a 401, refreshes once and retries. If refresh fails, signs out. */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const api = inject(API_URL);

  // Only our API, and never the auth endpoints themselves
  if (!req.url.startsWith(api) || req.url.startsWith(`${api}/auth/`)) return next(req);
  const send = (token: string) => next(withBearer(req, token));

  const refreshAndSend = () =>
    auth.refresh().pipe(
      catchError((e) => {
        if (e instanceof ApiError && e.status !== 0) auth.expireSession(); // keep session on network errors
        return throwError(() => e);
      }),
      switchMap(send),
    );

  const token = auth.accessToken();
  if (!token) return refreshAndSend();

  return send(token).pipe(
    catchError((e) => (isUnauthorized(e) ? refreshAndSend() : throwError(() => e))),
  );
};

const withBearer = (req: HttpRequest<unknown>, token: string) =>
  req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
