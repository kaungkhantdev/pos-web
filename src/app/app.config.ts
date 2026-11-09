import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/auth/auth.interceptor';
import { apiErrorInterceptor } from './core/api/api-error.interceptor';
import { AuthService } from './core/auth/auth.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    // auth runs first, so the 401s it sees have already been turned into ApiError
    provideHttpClient(withFetch(), withInterceptors([authInterceptor, apiErrorInterceptor])),
    provideAppInitializer(() => inject(AuthService).restore())
  ],
};
