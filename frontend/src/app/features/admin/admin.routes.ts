import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./admin-layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    children: [
      { path: 'dashboard', loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'orders', loadComponent: () => import('./orders/orders.component').then(m => m.AdminOrdersComponent) },
      { path: 'products', loadComponent: () => import('./products/products.component').then(m => m.AdminProductsComponent) },
      { path: 'categories', loadComponent: () => import('./categories/categories.component').then(m => m.AdminCategoriesComponent) },
      { path: 'customers', loadComponent: () => import('./customers/customers.component').then(m => m.AdminCustomersComponent) },
      { path: 'reports', loadComponent: () => import('./reports/reports.component').then(m => m.AdminReportsComponent) },
      { path: 'settings', loadComponent: () => import('./settings/settings.component').then(m => m.AdminSettingsComponent) },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
];
