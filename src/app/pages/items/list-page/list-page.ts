import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AppHeaderComponent } from '../../../components/shared/app-header/app-header';
import { ItemModalComponent } from '../../../components/items/item-modal/item-modal';
import {
  CreateInventoryItemPayload,
  InventoryItemStatus,
} from '../../../models/items/inventory-item.model';
import { InventoryItemsService } from '../../../services/items/inventory-items.service';

@Component({
  selector: 'app-list-page',
  standalone: true,
  imports: [CommonModule, RouterLink, AppHeaderComponent, ItemModalComponent],
  templateUrl: './list-page.html',
  styleUrl: './list-page.scss',
})
export class ListPageComponent {
  private readonly inventoryItemsService = inject(InventoryItemsService);

  readonly filterQuery = signal('');
  readonly showNewItemModal = signal(false);
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

  onInputFilterItems(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.filterQuery.set(value);
    this.inventoryItemsService.search(value);
  }

  onClickPrevPage(): void {
    const { page } = this.pagination();
    if (page > 1) this.inventoryItemsService.loadPage(page - 1);
  }

  onClickNextPage(): void {
    const { page, totalPages } = this.pagination();
    if (page < totalPages) this.inventoryItemsService.loadPage(page + 1);
  }

  onClickGoToPage(page: number): void {
    this.inventoryItemsService.loadPage(page);
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

  onClickDeleteItem(itemId: number): void {
    this.inventoryItemsService.deleteItem(itemId);
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
