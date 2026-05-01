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

  login(credentials: AuthCredentials): Observable<AuthResponse> {
    return this.requestService.post<AuthResponse>('/auth/login', credentials).pipe(
      tap(({ token, user }) => {
        localStorage.setItem('auth_token', token);
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
          this.currentUserState.set(user);
        })
      );
  }

  logout(): void {
    localStorage.removeItem('auth_token');
    this.currentUserState.set(null);
  }
}
