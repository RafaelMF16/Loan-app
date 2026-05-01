import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { AuthLayoutComponent } from '../../../components/auth/auth-layout/auth-layout';
import { LoginFormComponent } from '../../../components/auth/login-form/login-form';
import { AuthCredentials } from '../../../models/auth/auth-credentials.model';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [AuthLayoutComponent, LoginFormComponent],
  templateUrl: './login-page.html',
  styleUrl: './login-page.scss',
})
export class LoginPageComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly authError = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  onClickLogin(credentials: AuthCredentials): void {
    this.authService.login(credentials).subscribe({
      next: ({ user }) => {
        this.authError.set(null);
        this.successMessage.set(`Bem-vindo de volta, ${user.name}.`);
        void this.router.navigateByUrl('/items');
      },
      error: (err: { error?: { message?: string } }) => {
        this.successMessage.set(null);
        this.authError.set(err?.error?.message ?? 'E-mail ou senha inválidos.');
      },
    });
  }
}
