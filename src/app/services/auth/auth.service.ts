import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { AuthCredentials } from '../../models/auth/auth-credentials.model';
import { LoggedUser } from '../../models/auth/logged-user.model';
import { RegisterPayload } from '../../models/auth/register-payload.model';
import { RequestService } from '../request/request.service';

interface AuthResponse {
  token: string;
  user: LoggedUser;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly requestService = inject(RequestService);
  private readonly currentUserState = signal<LoggedUser | null>(null);

  readonly currentUser = computed(() => this.currentUserState());

  constructor() {
    const stored = localStorage.getItem('auth_user');
    if (stored) {
      try {
        this.currentUserState.set(JSON.parse(stored) as LoggedUser);
      } catch {
        // ignore corrupt data
      }
    }
  }

  login(credentials: AuthCredentials): Observable<AuthResponse> {
    return this.requestService.post<AuthResponse>('/auth/login', credentials).pipe(
      tap(({ token, user }) => {
        localStorage.setItem('auth_token', token);
        localStorage.setItem('auth_user', JSON.stringify(user));
        this.currentUserState.set(user);
      })
    );
  }

  register(payload: RegisterPayload): Observable<AuthResponse> {
    return this.requestService
      .post<AuthResponse>('/auth/register', {
        name: payload.name,
        email: payload.email,
        password: payload.password,
      })
      .pipe(
        tap(({ token, user }) => {
          localStorage.setItem('auth_token', token);
          localStorage.setItem('auth_user', JSON.stringify(user));
          this.currentUserState.set(user);
        })
      );
  }

  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    this.currentUserState.set(null);
  }
}
