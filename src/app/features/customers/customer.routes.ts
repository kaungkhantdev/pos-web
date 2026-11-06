import { Routes } from '@angular/router';

export const customerRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/customers/customers').then((m) => m.Customers),
  }
]
