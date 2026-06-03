import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { AppHeaderComponent } from '../../../components/shared/app-header/app-header';
import { Loan, LoanStatus } from '../../../models/loans/loan.model';
import { LoansService } from '../../../services/loans/loans.service';
import { NotificationService } from '../../../services/notification/notification.service';

@Component({
  selector: 'app-loans-detail-page',
  standalone: true,
  imports: [CommonModule, RouterLink, AppHeaderComponent],
  templateUrl: './loans-detail-page.html',
})
export class LoansDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly loansService = inject(LoansService);
  private readonly notif = inject(NotificationService);

  readonly loan = signal<Loan | null>(null);
  readonly loading = signal(true);
  readonly confirmReturn = signal(false);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loansService.fetchById(id).subscribe({
      next: (l) => { this.loan.set(l); this.loading.set(false); },
      error: () => { this.loading.set(false); this.router.navigate(['/loans']); },
    });
  }

  onClickRequestReturn(): void {
    this.confirmReturn.set(true);
  }

  onClickCancelReturn(): void {
    this.confirmReturn.set(false);
  }

  onClickConfirmReturn(): void {
    const loan = this.loan();
    if (!loan) return;
    this.loansService.returnLoan(loan.id).subscribe({
      next: (updated) => {
        this.loan.set(updated);
        this.confirmReturn.set(false);
        this.notif.success('Devolução registrada com sucesso!');
      },
      error: (err) => {
        this.confirmReturn.set(false);
        this.notif.error(err?.error?.message ?? 'Erro ao registrar devolução.');
      },
    });
  }

  getOverdueDays(loan: Loan): number | null {
    if (loan.status !== 'atrasado' || !loan.expectedReturnDate) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(loan.expectedReturnDate);
    due.setHours(0, 0, 0, 0);
    return Math.floor((today.getTime() - due.getTime()) / 86400000);
  }

  getLoanStatusLabel(status: LoanStatus): string {
    switch (status) {
      case 'ativo': return 'Ativo';
      case 'devolvido': return 'Devolvido';
      case 'atrasado': return 'Atrasado';
    }
  }

  getLoanStatusClasses(status: LoanStatus): string {
    switch (status) {
      case 'ativo': return 'bg-amber-50 text-amber-700';
      case 'devolvido': return 'bg-emerald-50 text-emerald-700';
      case 'atrasado': return 'bg-rose-50 text-rose-700';
    }
  }

  isReturnable(loan: Loan): boolean {
    return loan.status === 'ativo' || loan.status === 'atrasado';
  }

  formatDate(dateStr?: string): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('pt-BR');
  }

  formatDateTime(dateStr?: string): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
  }
}
