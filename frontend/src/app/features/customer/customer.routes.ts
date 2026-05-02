import { Routes } from '@angular/router';

export const CUSTOMER_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./customer-layout/customer-layout.component').then(m => m.CustomerLayoutComponent),
    children: [
      { path: 'products', loadComponent: () => import('./products/products.component').then(m => m.CustomerProductsComponent) },
      { path: 'cart', loadComponent: () => import('./cart/cart.component').then(m => m.CartComponent) },
      { path: 'orders', loadComponent: () => import('./orders/orders.component').then(m => m.CustomerOrdersComponent) },
      { path: 'profile', loadComponent: () => import('./profile/profile.component').then(m => m.ProfileComponent) },
      { path: '', redirectTo: 'products', pathMatch: 'full' },
    ],
  },
];
