import { Routes } from '@angular/router';

export const reportRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/reports/reports').then((m) => m.Reports)
  }
]
