import { Routes } from '@angular/router';

export const authRoutes: Routes = [
  {
    path: 'login',
    title: 'Login',
    loadComponent: () =>
      import("./components/login/login").then(m => m.Login),
  }
]
