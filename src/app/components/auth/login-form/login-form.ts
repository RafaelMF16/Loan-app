import { CommonModule } from '@angular/common';
import { Component, computed, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { AuthCredentials } from '../../../models/auth/auth-credentials.model';

@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login-form.html',
  styleUrl: './login-form.scss',
})
export class LoginFormComponent {
  private readonly formBuilder = inject(FormBuilder);

  readonly authError = input<string | null>(null);
  readonly submitted = output<AuthCredentials>();
  readonly passwordVisible = signal(false);

  readonly form = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  readonly passwordMinLength = 8;
  readonly hasError = computed(() => !!this.authError());

  onClickSubmitLogin(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitted.emit(this.form.getRawValue());
  }

  onClickTogglePasswordVisibility(): void {
    this.passwordVisible.update((value) => !value);
  }

  fieldInvalid(fieldName: 'email' | 'password'): boolean {
    const control = this.form.controls[fieldName];
    return control.invalid && (control.touched || control.dirty);
  }
}
