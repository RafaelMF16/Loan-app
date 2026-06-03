import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AppHeaderComponent } from '../../../components/shared/app-header/app-header';
import { ItemModalComponent } from '../../../components/items/item-modal/item-modal';
import { LoanModalComponent } from '../../../components/loans/loan-modal/loan-modal';
import {
  CreateInventoryItemPayload,
  InventoryItem,
  InventoryItemStatus,
} from '../../../models/items/inventory-item.model';
import { CreateLoanPayload } from '../../../models/loans/loan.model';
import { InventoryItemsService } from '../../../services/items/inventory-items.service';
import { LoansService } from '../../../services/loans/loans.service';
import { NotificationService } from '../../../services/notification/notification.service';

type StatusFilter = '' | 'disponivel' | 'emprestado';

@Component({
  selector: 'app-list-page',
  standalone: true,
  imports: [CommonModule, RouterLink, AppHeaderComponent, ItemModalComponent, LoanModalComponent],
  templateUrl: './list-page.html',
  styleUrl: './list-page.scss',
})
export class ListPageComponent implements OnInit {
  private readonly inventoryItemsService = inject(InventoryItemsService);
  private readonly loansService = inject(LoansService);
  private readonly notif = inject(NotificationService);

  readonly filterQuery = signal('');
  readonly statusFilter = signal<StatusFilter>('');
  readonly showNewItemModal = signal(false);
  readonly showLoanModal = signal(false);
  readonly loanTargetItem = signal<InventoryItem | null>(null);
  readonly confirmDeleteId = signal<number | null>(null);

  readonly items = this.inventoryItemsService.items;
  readonly pagination = this.inventoryItemsService.pagination;

  readonly pages = computed(() =>
    Array.from({ length: this.pagination().totalPages }, (_, i) => i + 1)
  );

  readonly rangeText = computed(() => {
    const { page, perPage, total, data } = this.pagination();
    if (total === 0) return '0 itens';
    const start = (page - 1) * perPage + 1;
    const end = start + data.length - 1;
    return `${start}–${end} de ${total}`;
  });

  ngOnInit(): void {
    this.inventoryItemsService.loadPage(1);
  }

  onInputFilterItems(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.filterQuery.set(value);
    this.inventoryItemsService.search(value);
  }

  onClickStatusTab(status: StatusFilter): void {
    this.statusFilter.set(status);
    this.confirmDeleteId.set(null);
    this.inventoryItemsService.loadPage(1, this.filterQuery(), status);
  }

  onClickPrevPage(): void {
    const { page } = this.pagination();
    if (page > 1) this.inventoryItemsService.loadPage(page - 1, this.filterQuery(), this.statusFilter());
  }

  onClickNextPage(): void {
    const { page, totalPages } = this.pagination();
    if (page < totalPages) this.inventoryItemsService.loadPage(page + 1, this.filterQuery(), this.statusFilter());
  }

  onClickGoToPage(page: number): void {
    this.inventoryItemsService.loadPage(page, this.filterQuery(), this.statusFilter());
  }

  onClickOpenNewItemModal(): void {
    this.showNewItemModal.set(true);
  }

  onClickCloseNewItemModal(): void {
    this.showNewItemModal.set(false);
  }

  onClickSaveNewItem(payload: CreateInventoryItemPayload): void {
    this.inventoryItemsService.addItem(payload);
    this.showNewItemModal.set(false);
  }

  onClickRequestDelete(itemId: number): void {
    this.confirmDeleteId.set(itemId);
  }

  onClickCancelDelete(): void {
    this.confirmDeleteId.set(null);
  }

  onClickConfirmDelete(itemId: number): void {
    this.inventoryItemsService.deleteItem(itemId).subscribe({
      next: () => {
        this.confirmDeleteId.set(null);
        this.inventoryItemsService.loadPage(this.pagination().page, this.filterQuery(), this.statusFilter());
      },
      error: (err) => {
        this.confirmDeleteId.set(null);
        this.notif.error(err?.error?.message ?? 'Erro ao excluir item.');
      },
    });
  }

  onClickOpenLoanModal(item: InventoryItem): void {
    this.loanTargetItem.set(item);
    this.showLoanModal.set(true);
  }

  onClickCloseLoanModal(): void {
    this.showLoanModal.set(false);
    this.loanTargetItem.set(null);
  }

  onClickSaveLoan(payload: CreateLoanPayload): void {
    this.loansService.createLoan(payload).subscribe({
      next: () => {
        this.notif.success('Empréstimo registrado com sucesso!');
        this.showLoanModal.set(false);
        this.loanTargetItem.set(null);
        this.inventoryItemsService.loadPage(this.pagination().page, this.filterQuery(), this.statusFilter());
      },
      error: (err) => {
        this.notif.error(err?.error?.message ?? 'Erro ao registrar empréstimo.');
      },
    });
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
}
