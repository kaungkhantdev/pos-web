import { Routes } from '@angular/router';
import { guestGuard } from './core/auth/guest.guard';
import { AuthLayout } from './core/layout/auth-layout/auth-layout';
import { AppShell } from './core/layout/app-shell/app-shell';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  {
    path: 'auth',
    component: AuthLayout,
    canActivate: [guestGuard],
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.authRoutes),
  },
  {
    path: '',
    component: AppShell,
    canActivate: [authGuard],
    canActivateChild: [authGuard],
    children: [
      {
        path: 'dashboard',
        title: 'Dashboard',
        loadChildren: () =>
          import('./features/dashboard/dashboard.routes').then((m) => m.dashboardRoutes),
      },
      {
        path: 'pos',
        title: 'POS',
        loadChildren: () => import('./features/pos/pos.routes').then((m) => m.posRoutes),
      },
      {
        path: 'categories',
        title: 'Menu Categories',
        loadChildren: () =>
          import('./features/categories/category.routes').then((m) => m.categoriesRoutes),
      },
      {
        path: 'inventory',
        title: 'Ingredients',
        loadChildren: () =>
          import('./features/inventory/inventory.routes').then((m) => m.inventoryRoutes),
      },
      {
        path: 'customers',
        title: 'Customers',
        loadChildren: () =>
          import('./features/customers/customer.routes').then((m) => m.customerRoutes),
      },
      {
        path: 'tables',
        title: 'Tables',
        loadChildren: () => import('./features/tables/table.routes').then((m) => m.tableRoutes),
      },
      {
        path: 'orders',
        title: 'Orders',
        loadChildren: () => import('./features/orders/order.routes').then((m) => m.orderRoutes),
      },
      {
        path: 'kitchen',
        title: 'Kitchen Display',
        loadChildren: () =>
          import('./features/kitchen/kitchen.routes').then((m) => m.kitchenRoutes),
      },
      {
        path: 'reports',
        title: 'Reports',
        loadChildren: () =>
          import('./features/reports/report.routes').then((m) => m.reportRoutes),
      },
      {
        path: 'products',
        title: 'Menu Items',
        loadChildren: () =>
          import('./features/products/product.routes').then((m) => m.productRoutes),
      },
      {
        path: 'users',
        title: 'Staff',
        loadChildren: () =>
          import('./features/users/user.routes').then((m) => m.userRoutes),
      },
      {
        path: 'settings',
        title: 'Settings',
        loadChildren: () =>
          import('./features/settings/setting.routes').then((m) => m.settingRoutes),
      }
    ],
  },
];
// children: [
//   { path: 'settings',   title: 'Settings',        loadComponent: () => import('./features/settings/settings').then((m) => m.Settings) },
// ],
