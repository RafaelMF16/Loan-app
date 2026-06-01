import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { EMPTY, switchMap, catchError, filter, map } from 'rxjs';

import { AppHeaderComponent } from '../../../components/shared/app-header/app-header';
import { ItemModalComponent } from '../../../components/items/item-modal/item-modal';
import { LoanModalComponent } from '../../../components/loans/loan-modal/loan-modal';
import { CreateInventoryItemPayload, InventoryItemStatus } from '../../../models/items/inventory-item.model';
import { CreateLoanPayload, Loan } from '../../../models/loans/loan.model';
import { InventoryItemsService } from '../../../services/items/inventory-items.service';
import { LoansService } from '../../../services/loans/loans.service';
import { NotificationService } from '../../../services/notification/notification.service';

@Component({
  selector: 'app-detail-page',
  standalone: true,
  imports: [CommonModule, RouterLink, AppHeaderComponent, ItemModalComponent, LoanModalComponent],
  templateUrl: './detail-page.html',
  styleUrl: './detail-page.scss',
})
export class DetailPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly inventoryItemsService = inject(InventoryItemsService);
  private readonly loansService = inject(LoansService);
  private readonly notif = inject(NotificationService);

  private readonly itemId = toSignal(
    this.route.paramMap.pipe(map((params) => Number(params.get('id')))),
    { initialValue: 0 }
  );
  private readonly refreshCounter = signal(0);
  private readonly loanRefreshCounter = signal(0);

  readonly item = toSignal(
    toObservable(computed(() => ({ id: this.itemId(), _r: this.refreshCounter() }))).pipe(
      filter(({ id }) => id > 0),
      switchMap(({ id }) =>
        this.inventoryItemsService.fetchById(id).pipe(catchError(() => EMPTY))
      )
    )
  );

  readonly loanHistory = toSignal(
    toObservable(computed(() => ({ id: this.itemId(), _r: this.loanRefreshCounter() }))).pipe(
      filter(({ id }) => id > 0),
      switchMap(({ id }) =>
        this.loansService.fetchByItemId(id).pipe(catchError(() => EMPTY))
      )
    )
  );

  readonly activeLoan = computed<Loan | null>(() => {
    const history = this.loanHistory();
    if (!history) return null;
    return history.data.find((l) => l.status === 'ativo' || l.status === 'atrasado') ?? null;
  });

  readonly showEditModal = signal(false);
  readonly showLoanModal = signal(false);
  readonly showHistory = signal(false);

  onClickOpenEditModal(): void {
    this.showEditModal.set(true);
  }

  onClickCloseEditModal(): void {
    this.showEditModal.set(false);
  }

  onClickSaveEdit(payload: CreateInventoryItemPayload): void {
    const id = this.item()?.id;
    if (!id) return;

    this.inventoryItemsService.updateItem(id, payload).subscribe({
      next: () => {
        this.notif.success('Item atualizado com sucesso!');
        this.showEditModal.set(false);
        this.refreshCounter.update((n) => n + 1);
      },
      error: (err) => {
        this.notif.error(err?.error?.message ?? 'Erro ao atualizar item.');
      },
    });
  }

  onClickOpenLoanModal(): void {
    this.showLoanModal.set(true);
  }

  onClickCloseLoanModal(): void {
    this.showLoanModal.set(false);
  }

  onClickSaveLoan(payload: CreateLoanPayload): void {
    this.loansService.createLoan(payload).subscribe({
      next: () => {
        this.notif.success('Empréstimo registrado com sucesso!');
        this.showLoanModal.set(false);
        this.refreshCounter.update((n) => n + 1);
        this.loanRefreshCounter.update((n) => n + 1);
      },
      error: (err) => {
        this.notif.error(err?.error?.message ?? 'Erro ao registrar empréstimo.');
      },
    });
  }

  onClickReturnItem(): void {
    const loan = this.activeLoan();
    if (!loan) {
      // Item emprestado sem loan record — só atualiza o status via item update
      const item = this.item();
      if (!item) return;
      this.inventoryItemsService.updateItem(item.id, { ...item, status: 'disponivel' }).subscribe({
        next: () => {
          this.notif.success('Item marcado como disponível.');
          this.refreshCounter.update((n) => n + 1);
        },
        error: (err) => {
          this.notif.error(err?.error?.message ?? 'Erro ao atualizar status.');
        },
      });
      return;
    }

    this.loansService.returnLoan(loan.id).subscribe({
      next: () => {
        this.notif.success('Devolução registrada com sucesso!');
        this.refreshCounter.update((n) => n + 1);
        this.loanRefreshCounter.update((n) => n + 1);
      },
      error: (err) => {
        this.notif.error(err?.error?.message ?? 'Erro ao registrar devolução.');
      },
    });
  }

  toggleHistory(): void {
    this.showHistory.update((v) => !v);
  }

  getStatusLabel(status: InventoryItemStatus): string {
    return status === 'disponivel' ? 'Disponivel' : 'Emprestado';
  }

  getStatusClasses(status: InventoryItemStatus): string {
    return status === 'disponivel'
      ? 'bg-emerald-50 text-emerald-700'
      : 'bg-amber-50 text-amber-700';
  }

  getStatusDotClasses(status: InventoryItemStatus): string {
    return status === 'disponivel' ? 'bg-emerald-500' : 'bg-amber-500';
  }

  getLoanStatusLabel(status: string): string {
    switch (status) {
      case 'ativo': return 'Ativo';
      case 'devolvido': return 'Devolvido';
      case 'atrasado': return 'Atrasado';
      default: return status;
    }
  }

  getLoanStatusClasses(status: string): string {
    switch (status) {
      case 'ativo': return 'bg-amber-50 text-amber-700';
      case 'devolvido': return 'bg-emerald-50 text-emerald-700';
      case 'atrasado': return 'bg-rose-50 text-rose-700';
      default: return 'bg-slate-50 text-slate-700';
    }
  }

  formatDate(dateStr?: string): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('pt-BR');
  }
}
