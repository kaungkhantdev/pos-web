import { Routes } from '@angular/router';

export const inventoryRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/inventory/inventory').then((m) => m.Inventory),
  }
]
