import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './auth-layout.html',
  styleUrl: './auth-layout.scss',
})
export class AuthLayoutComponent {
  readonly title = input.required<string>();
  readonly subtitle = input.required<string>();
  readonly activeTab = input.required<'login' | 'register'>();
}
