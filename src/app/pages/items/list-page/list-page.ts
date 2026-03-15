import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AppHeaderComponent } from '../../../components/shared/app-header/app-header';
import { ItemModalComponent } from '../../../components/items/item-modal/item-modal';
import {
  CreateInventoryItemPayload,
  InventoryItem,
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

  readonly filteredItems = computed(() => {
    const query = this.filterQuery().trim().toLowerCase();

    if (!query) {
      return this.items();
    }

    return this.items().filter((item) =>
      [item.name, item.description, this.getStatusLabel(item.status)]
        .join(' ')
        .toLowerCase()
        .includes(query)
    );
  });

  onInputFilterItems(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.filterQuery.set(input.value);
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
