import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { AppHeaderComponent } from '../../components/shared/app-header/app-header';
import { LoanStatus } from '../../models/loans/loan.model';
import { LoanFilters, LoansService } from '../../services/loans/loans.service';

type ReportTab = 'todos' | 'ativo' | 'devolvido' | 'atrasado';

@Component({
  selector: 'app-reports-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AppHeaderComponent],
  templateUrl: './reports-page.html',
})
export class ReportsPageComponent {
  private readonly loansService = inject(LoansService);
  private readonly fb = inject(FormBuilder);

  readonly form: FormGroup = this.fb.group({
    startDate: [''],
    endDate: [''],
  });

  readonly activeTab = signal<ReportTab>('todos');
  readonly hasSearched = signal(false);
  readonly loans = this.loansService.loans;
  readonly pagination = this.loansService.pagination;

  onClickTab(tab: ReportTab): void {
    this.activeTab.set(tab);
    if (this.hasSearched()) this.search();
  }

  onClickSearch(): void {
    this.hasSearched.set(true);
    this.search();
  }

  onClickClear(): void {
    this.form.reset({ startDate: '', endDate: '' });
    this.activeTab.set('todos');
    this.hasSearched.set(false);
  }

  onClickPrevPage(): void {
    const { page } = this.pagination();
    if (page > 1) this.search(page - 1);
  }

  onClickNextPage(): void {
    const { page, totalPages } = this.pagination();
    if (page < totalPages) this.search(page + 1);
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

  formatDate(dateStr?: string): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('pt-BR');
  }

  private search(page = 1): void {
    const { startDate, endDate } = this.form.value;
    const tab = this.activeTab();
    const filters: LoanFilters = {
      status: tab === 'todos' ? undefined : tab,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    };
    this.loansService.loadPage(page, filters);
  }
}
