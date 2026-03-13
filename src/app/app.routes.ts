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
      import('./features/auth/pages/login-page/login-page').then(
        (module) => module.LoginPageComponent
      ),
  },
  {
    path: 'auth/register',
    loadComponent: () =>
      import('./features/auth/pages/register-page/register-page').then(
        (module) => module.RegisterPageComponent
      ),
  },
  {
    path: '**',
    redirectTo: 'auth/login',
  },
];
