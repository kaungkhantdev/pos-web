import { Routes } from '@angular/router';

export const posRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/pos/pos').then((m) => m.Pos),
  }
]
