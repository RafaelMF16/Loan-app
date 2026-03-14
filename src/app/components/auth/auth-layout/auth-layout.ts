import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AppHeaderComponent } from '../../shared/app-header/app-header';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterLink, AppHeaderComponent],
  templateUrl: './auth-layout.html',
  styleUrl: './auth-layout.scss',
})
export class AuthLayoutComponent {
  readonly title = input.required<string>();
  readonly subtitle = input.required<string>();
  readonly activeTab = input.required<'login' | 'register'>();
}
