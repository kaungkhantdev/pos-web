import { Routes } from '@angular/router';

export const settingRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/settings/settings').then(m => m.Settings),
  }
]
