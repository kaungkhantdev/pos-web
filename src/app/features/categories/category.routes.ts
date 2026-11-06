import { Routes } from '@angular/router';

export const categoriesRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/categories/categories').then((m) => m.Categories),
  }
]
