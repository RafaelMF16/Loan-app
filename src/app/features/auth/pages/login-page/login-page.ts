import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { AuthLayoutComponent } from '../../components/auth-layout/auth-layout';
import { LoginFormComponent } from '../../components/login-form/login-form';
import { AuthCredentials } from '../../models/auth-credentials.model';
import { StaticAuthService } from '../../services/static-auth.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [AuthLayoutComponent, LoginFormComponent],
  templateUrl: './login-page.html',
})
export class LoginPageComponent {
  private readonly staticAuthService = inject(StaticAuthService);
  private readonly router = inject(Router);

  readonly authError = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  handleLogin(credentials: AuthCredentials): void {
    const user = this.staticAuthService.login(credentials);

    if (!user) {
      this.successMessage.set(null);
      this.authError.set('Invalid email or password. Try one of the demo users below.');
      return;
    }

    this.authError.set(null);
    this.successMessage.set(`Welcome back, ${user.name}. Static login completed successfully.`);
    void this.router.navigateByUrl('/auth/login');
  }
}
