import { Routes } from '@angular/router';

export const kitchenRoutes: Routes = [
  {
    path: '',
    data: { fullHeight: true },
    loadComponent: () =>
      import('./components/kitchen/kitchen').then((m) => m.Kitchen),
  }
]
