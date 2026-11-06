import { Routes } from '@angular/router';

export const orderRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/orders/orders').then((m) => m.Orders),
  }
]
