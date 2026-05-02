import { Routes } from '@angular/router';
import { authGuard, adminGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/auth/login', pathMatch: 'full' },

  {
    path: 'auth',
    canActivate: [guestGuard],
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES),
  },

  {
    path: 'admin',
    canActivate: [adminGuard],
    loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES),
  },

  {
    path: 'customer',
    canActivate: [authGuard],
    loadChildren: () => import('./features/customer/customer.routes').then(m => m.CUSTOMER_ROUTES),
  },

  { path: '**', redirectTo: '/auth/login' },
];
