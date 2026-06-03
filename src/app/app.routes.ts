import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'auth/login',
  },
  {
    path: 'auth/login',
    loadComponent: () =>
      import('./pages/auth/login-page/login-page').then(
        (module) => module.LoginPageComponent
      ),
  },
  {
    path: 'auth/register',
    loadComponent: () =>
      import('./pages/auth/register-page/register-page').then(
        (module) => module.RegisterPageComponent
      ),
  },
  {
    path: 'items',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/items/list-page/list-page').then(
        (module) => module.ListPageComponent
      ),
  },
  {
    path: 'items/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/items/detail-page/detail-page').then(
        (module) => module.DetailPageComponent
      ),
  },
  {
    path: 'loans',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/loans/list-page/loans-list-page').then(
        (module) => module.LoansListPageComponent
      ),
  },
  {
    path: 'loans/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/loans/detail-page/loans-detail-page').then(
        (module) => module.LoansDetailPageComponent
      ),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/dashboard/dashboard-page').then(
        (module) => module.DashboardPageComponent
      ),
  },
  {
    path: 'reports',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/reports/reports-page').then(
        (module) => module.ReportsPageComponent
      ),
  },
  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    loadComponent: () =>
      import('./pages/admin/admin-page').then(
        (module) => module.AdminPageComponent
      ),
  },
  {
    path: '**',
    redirectTo: 'auth/login',
  },
];
