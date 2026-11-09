import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { ApiError, ApiResponse } from './api.types';
import { readableMessage } from './error-messages';

export const apiErrorInterceptor: HttpInterceptorFn = (req, next) =>
  next(req).pipe(
    catchError((e: unknown) => {
      if (!(e instanceof HttpErrorResponse)) return throwError(() => e);

      const body = e.error as Partial<ApiResponse<unknown>> | null;
      const err = typeof body === 'object' ? body?.error : null;
      const code = err?.code ?? (e.status === 0 ? 'NETWORK_ERROR' : 'UNKNOWN_ERROR');

      return throwError(
        () =>
          new ApiError(
            e.status,
            code,
            readableMessage(e.status, err?.code, err?.message),
            err?.details ?? [],
          ),
      );
    }),
  );
