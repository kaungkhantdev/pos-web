import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

export const guestGuard: CanActivateFn = (route, state) => {
  return inject(AuthService).isLoggedIn() ? inject(Router).createUrlTree(['/dashboard']) : true;
};
