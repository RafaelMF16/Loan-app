import { Component, inject, signal } from '@angular/core';

import { AuthLayoutComponent } from '../../../components/auth/auth-layout/auth-layout';
import { RegisterFormComponent } from '../../../components/auth/register-form/register-form';
import { RegisterPayload } from '../../../models/auth/register-payload.model';
import { StaticAuthService } from '../../../services/auth/static-auth.service';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [AuthLayoutComponent, RegisterFormComponent],
  templateUrl: './register-page.html',
  styleUrl: './register-page.scss',
})
export class RegisterPageComponent {
  private readonly staticAuthService = inject(StaticAuthService);

  readonly feedback = signal<{ type: 'success' | 'error'; message: string } | null>(null);

  onClickRegister(payload: RegisterPayload): void {
    const result = this.staticAuthService.register(payload);

    this.feedback.set({
      type: result.success ? 'success' : 'error',
      message: result.message,
    });
  }
}
