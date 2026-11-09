import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  return  inject(AuthService).isLoggedIn()
    ? true
    : inject(Router).createUrlTree(['/auth/login'], { queryParams: { returnUrl: state.url } });
};
