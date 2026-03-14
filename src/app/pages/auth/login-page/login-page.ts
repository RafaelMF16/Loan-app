import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { AuthLayoutComponent } from '../../../components/auth/auth-layout/auth-layout';
import { LoginFormComponent } from '../../../components/auth/login-form/login-form';
import { AuthCredentials } from '../../../models/auth/auth-credentials.model';
import { StaticAuthService } from '../../../services/auth/static-auth.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [AuthLayoutComponent, LoginFormComponent],
  templateUrl: './login-page.html',
  styleUrl: './login-page.scss',
})
export class LoginPageComponent {
  private readonly staticAuthService = inject(StaticAuthService);
  private readonly router = inject(Router);

  readonly authError = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  onClickLogin(credentials: AuthCredentials): void {
    const user = this.staticAuthService.login(credentials);

    if (!user) {
      this.successMessage.set(null);
      this.authError.set('E-mail ou senha inválidos.');
      return;
    }

    this.authError.set(null);
    this.successMessage.set(`Bem-vindo de volta, ${user.name}. Login realizado com sucesso.`);
    void this.router.navigateByUrl('/auth/login');
  }
}
