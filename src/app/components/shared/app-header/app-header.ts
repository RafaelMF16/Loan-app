import { Component, HostListener, inject, input, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './app-header.html',
  styleUrl: './app-header.scss',
})
export class AppHeaderComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly showAvatar = input(false);
  readonly menuOpen = signal(false);
  readonly currentUser = this.authService.currentUser;

  toggleMenu(): void {
    this.menuOpen.update((v) => !v);
  }

  onClickLogout(): void {
    this.menuOpen.set(false);
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('[data-user-menu]')) {
      this.menuOpen.set(false);
    }
  }
}
