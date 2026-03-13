import { Component, input } from '@angular/core';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  templateUrl: './auth-layout.html',
})
export class AuthLayoutComponent {
  readonly eyebrow = input('Item Loan Management');
  readonly title = input.required<string>();
  readonly description = input.required<string>();
  readonly panelTitle = input('Track, lend, and recover every item with confidence.');
  readonly panelBody = input(
    'Start with a simple authentication flow designed for teams managing equipment, inventory, and internal loans.'
  );
}
