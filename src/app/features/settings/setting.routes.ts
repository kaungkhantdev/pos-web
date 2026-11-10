import { Routes } from '@angular/router';
import { unsavedChangesGuard } from '../../core/guards/unsaved-changes.guard';

export const settingRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/settings/settings').then((m) => m.Settings),
    canDeactivate: [unsavedChangesGuard],
  },
];
