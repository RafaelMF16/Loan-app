import { Routes } from '@angular/router';

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
    path: '**',
    redirectTo: 'auth/login',
  },
];
