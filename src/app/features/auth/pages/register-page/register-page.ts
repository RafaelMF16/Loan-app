import { Component, inject, signal } from '@angular/core';

import { AuthLayoutComponent } from '../../components/auth-layout/auth-layout';
import { RegisterFormComponent } from '../../components/register-form/register-form';
import { RegisterPayload } from '../../models/register-payload.model';
import { StaticAuthService } from '../../services/static-auth.service';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [AuthLayoutComponent, RegisterFormComponent],
  templateUrl: './register-page.html',
})
export class RegisterPageComponent {
  private readonly staticAuthService = inject(StaticAuthService);

  readonly feedback = signal<{ type: 'success' | 'error'; message: string } | null>(null);

  handleRegister(payload: RegisterPayload): void {
    const result = this.staticAuthService.register(payload);

    this.feedback.set({
      type: result.success ? 'success' : 'error',
      message: result.message,
    });
  }
}
