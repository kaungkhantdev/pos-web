import { Routes } from '@angular/router';
import { guestGuard } from './features/auth/guest-guard';
import { AuthLayout } from './core/layout/auth-layout/auth-layout';
import { AppShell } from './core/layout/app-shell/app-shell';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  {
    path: 'auth',
    component: AuthLayout,
    canActivate: [guestGuard],
    loadChildren: () =>
      import('./features/auth/auth.routes').then((m) => m.authRoutes),
  },
  {
    path: '',
    component: AppShell,
    children: [
      {
        path: 'dashboard',
        title: 'Dashboard',
        loadChildren: () =>
          import('./features/dashboard/dashboard.routes').then((m) => m.dashboardRoutes),
      },
      {
        path: 'pos',
        title: 'Pos',
        loadChildren: () =>
          import('./features/pos/pos.routes').then((m) => m.posRoutes),
      }
    ]
  }
];
