import { Component, inject, signal } from '@angular/core';

import { AuthLayoutComponent } from '../../../components/auth/auth-layout/auth-layout';
import { RegisterFormComponent } from '../../../components/auth/register-form/register-form';
import { RegisterPayload } from '../../../models/auth/register-payload.model';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [AuthLayoutComponent, RegisterFormComponent],
  templateUrl: './register-page.html',
  styleUrl: './register-page.scss',
})
export class RegisterPageComponent {
  private readonly authService = inject(AuthService);

  readonly feedback = signal<{ type: 'success' | 'error'; message: string } | null>(null);

  onClickRegister(payload: RegisterPayload): void {
    this.authService.register(payload).subscribe({
      next: () => {
        this.feedback.set({
          type: 'success',
          message: 'Conta criada com sucesso. Agora você já pode entrar com essas credenciais.',
        });
      },
      error: (err: { error?: { message?: string } }) => {
        this.feedback.set({
          type: 'error',
          message: err?.error?.message ?? 'Erro ao registrar. Tente novamente.',
        });
      },
    });
  }
}
