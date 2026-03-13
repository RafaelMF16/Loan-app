import { Component, input } from '@angular/core';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  templateUrl: './auth-layout.html',
})
export class AuthLayoutComponent {
  readonly title = input.required<string>();
}
