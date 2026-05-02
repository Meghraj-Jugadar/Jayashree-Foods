import { Routes } from '@angular/router';

export const AUTH_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./auth-layout/auth-layout.component').then(m => m.AuthLayoutComponent),
    children: [
      { path: 'login', loadComponent: () => import('./login/login.component').then(m => m.LoginComponent) },
      { path: 'register', loadComponent: () => import('./register/register.component').then(m => m.RegisterComponent) },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
    ],
  },
];
