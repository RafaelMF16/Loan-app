import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';

import { CreateLoanPayload, Loan, PaginatedLoans } from '../../models/loans/loan.model';
import { RequestService } from '../request/request.service';

const EMPTY_PAGE: PaginatedLoans = { data: [], total: 0, page: 1, totalPages: 1, perPage: 10 };

export interface LoanFilters {
  status?: string;
  itemId?: number;
}

@Injectable({ providedIn: 'root' })
export class LoansService {
  private readonly requestService = inject(RequestService);
  private readonly paginationState = signal<PaginatedLoans>(EMPTY_PAGE);
  private readonly currentFilters = signal<LoanFilters>({});

  readonly pagination = this.paginationState.asReadonly();
  readonly loans = computed(() => this.paginationState().data);

  loadPage(page: number, filters: LoanFilters = this.currentFilters()): void {
    this.currentFilters.set(filters);
    const params = this.buildParams(page, filters);
    this.requestService.get<PaginatedLoans>(`/loans${params}`).subscribe({
      next: (result) => this.paginationState.set(result),
    });
  }

  fetchById(id: number): Observable<Loan> {
    return this.requestService.get<Loan>(`/loans/${id}`);
  }

  fetchByItemId(itemId: number, page = 1): Observable<PaginatedLoans> {
    return this.requestService.get<PaginatedLoans>(`/items/${itemId}/loans?page=${page}`);
  }

  createLoan(payload: CreateLoanPayload): Observable<Loan> {
    return this.requestService.post<Loan>('/loans', payload);
  }

  returnLoan(loanId: number): Observable<Loan> {
    return this.requestService.put<Loan>(`/loans/${loanId}/return`, {});
  }

  private buildParams(page: number, filters: LoanFilters): string {
    const params = new URLSearchParams({ page: String(page) });
    if (filters.status) params.set('status', filters.status);
    if (filters.itemId) params.set('itemId', String(filters.itemId));
    return `?${params.toString()}`;
  }
}
