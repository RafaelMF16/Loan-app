import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';

import { AppHeaderComponent } from '../../components/shared/app-header/app-header';
import { RequestService } from '../../services/request/request.service';

interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin';
  created_at: string;
}

@Component({
  selector: 'app-admin-page',
  standalone: true,
  imports: [CommonModule, AppHeaderComponent],
  templateUrl: './admin-page.html',
})
export class AdminPageComponent implements OnInit {
  private readonly requestService = inject(RequestService);

  readonly users = signal<AdminUser[]>([]);
  readonly loading = signal(true);

  ngOnInit(): void {
    this.requestService.get<AdminUser[]>('/admin/users').subscribe({
      next: (users) => {
        this.users.set(users);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('pt-BR');
  }

  getRoleLabel(role: 'user' | 'admin'): string {
    return role === 'admin' ? 'Administrador' : 'Usuário';
  }

  getRoleClasses(role: 'user' | 'admin'): string {
    return role === 'admin'
      ? 'bg-blue-50 text-blue-700'
      : 'bg-slate-100 text-slate-600';
  }
}
