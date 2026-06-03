import { Injectable, inject, signal } from '@angular/core';
import { RequestService } from '../request/request.service';

export interface DashboardStats {
  totalItems: number;
  availableItems: number;
  borrowedItems: number;
  totalLoans: number;
  activeLoans: number;
  returnedLoans: number;
  overdueLoans: number;
  avgLoanDurationDays: number | null;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly requestService = inject(RequestService);
  private readonly statsState = signal<DashboardStats | null>(null);

  readonly stats = this.statsState.asReadonly();

  loadStats(isAdmin = false): void {
    const path = isAdmin ? '/admin/dashboard' : '/dashboard';
    this.requestService.get<DashboardStats>(path).subscribe({
      next: (stats) => this.statsState.set(stats),
    });
  }
}
