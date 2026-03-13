import { Injectable, computed, signal } from '@angular/core';

import { AuthCredentials } from '../models/auth-credentials.model';
import { AuthUser } from '../models/auth-user.model';
import { RegisterPayload } from '../models/register-payload.model';

const STATIC_USERS: AuthUser[] = [
  {
    id: 1,
    name: 'Ana Silva',
    email: 'ana@loanapp.com',
    password: 'LoanApp123',
  },
  {
    id: 2,
    name: 'Bruno Costa',
    email: 'bruno@loanapp.com',
    password: 'SecurePass456',
  },
];

@Injectable({ providedIn: 'root' })
export class StaticAuthService {
  private readonly users = signal<AuthUser[]>(STATIC_USERS);
  private readonly currentUserState = signal<AuthUser | null>(null);

  readonly currentUser = computed(() => this.currentUserState());

  login(credentials: AuthCredentials): AuthUser | null {
    const normalizedEmail = credentials.email.trim().toLowerCase();
    const user = this.users().find(
      (item) =>
        item.email.toLowerCase() === normalizedEmail &&
        item.password === credentials.password
    );

    this.currentUserState.set(user ?? null);
    return user ?? null;
  }

  register(payload: RegisterPayload): { success: boolean; message: string } {
    const normalizedEmail = payload.email.trim().toLowerCase();
    const existingUser = this.users().some(
      (item) => item.email.toLowerCase() === normalizedEmail
    );

    if (existingUser) {
      return {
        success: false,
        message: 'This email is already in use by a static account.',
      };
    }

    const nextUser: AuthUser = {
      id: this.users().length + 1,
      name: payload.name.trim(),
      email: normalizedEmail,
      password: payload.password,
    };

    this.users.update((items) => [...items, nextUser]);

    return {
      success: true,
      message: 'Account created locally. You can now sign in with these credentials.',
    };
  }
}
