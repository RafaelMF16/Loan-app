import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AppHeaderComponent } from '../../../components/shared/app-header/app-header';
import { Loan, LoanStatus } from '../../../models/loans/loan.model';
import { LoansService } from '../../../services/loans/loans.service';
import { NotificationService } from '../../../services/notification/notification.service';

type FilterTab = 'todos' | 'ativo' | 'devolvido';

@Component({
  selector: 'app-loans-list-page',
  standalone: true,
  imports: [CommonModule, RouterLink, AppHeaderComponent],
  templateUrl: './loans-list-page.html',
  styleUrl: './loans-list-page.scss',
})
export class LoansListPageComponent implements OnInit {
  private readonly loansService = inject(LoansService);
  private readonly notif = inject(NotificationService);

  readonly activeTab = signal<FilterTab>('todos');
  readonly confirmReturnId = signal<number | null>(null);
  readonly loans = this.loansService.loans;
  readonly pagination = this.loansService.pagination;

  readonly pages = computed(() =>
    Array.from({ length: this.pagination().totalPages }, (_, i) => i + 1)
  );

  readonly rangeText = computed(() => {
    const { page, perPage, total, data } = this.pagination();
    if (total === 0) return '0 empréstimos';
    const start = (page - 1) * perPage + 1;
    const end = start + data.length - 1;
    return `${start}–${end} de ${total}`;
  });

  ngOnInit(): void {
    this.activeTab.set('todos');
    this.loansService.loadPage(1, {});
  }

  onClickTab(tab: FilterTab): void {
    this.activeTab.set(tab);
    this.confirmReturnId.set(null);
    const status = tab === 'todos' ? undefined : tab;
    this.loansService.loadPage(1, { status });
  }

  onClickPrevPage(): void {
    const { page } = this.pagination();
    if (page > 1) this.loansService.loadPage(page - 1, this.currentFilters());
  }

  onClickNextPage(): void {
    const { page, totalPages } = this.pagination();
    if (page < totalPages) this.loansService.loadPage(page + 1, this.currentFilters());
  }

  onClickGoToPage(page: number): void {
    this.loansService.loadPage(page, this.currentFilters());
  }

  onClickRequestReturn(loanId: number): void {
    this.confirmReturnId.set(loanId);
  }

  onClickCancelReturn(): void {
    this.confirmReturnId.set(null);
  }

  onClickConfirmReturn(loan: Loan): void {
    this.loansService.returnLoan(loan.id).subscribe({
      next: () => {
        this.confirmReturnId.set(null);
        this.notif.success('Devolução registrada com sucesso!');
        this.loansService.loadPage(this.pagination().page, this.currentFilters());
      },
      error: (err) => {
        this.confirmReturnId.set(null);
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

  private currentFilters() {
    const tab = this.activeTab();
    return { status: tab === 'todos' ? undefined : tab };
  }
}
