import { Routes } from '@angular/router';

export const tableRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/tables/tables').then((m) => m.Tables),
  }
]
