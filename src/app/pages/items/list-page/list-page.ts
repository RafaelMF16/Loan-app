import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { AppHeaderComponent } from '../../../components/shared/app-header/app-header';
import { ItemModalComponent } from '../../../components/items/item-modal/item-modal';
import {
  CreateInventoryItemPayload,
  InventoryItem,
  InventoryItemIcon,
  InventoryItemStatus,
} from '../../../models/items/inventory-item.model';

const INITIAL_ITEMS: InventoryItem[] = [
  {
    id: 1,
    name: 'MacBook Pro 16"',
    serialNumber: 'MBP-2024-001',
    description: 'Notebook para design e desenvolvimento.',
    status: 'emprestado',
    statusDetail: 'Devolucao em 3 dias',
    icon: 'notebook',
  },
  {
    id: 2,
    name: 'Sony Alpha A7 IV',
    serialNumber: 'SNY-CAM-882',
    description: 'Camera full-frame para producao audiovisual.',
    status: 'disponivel',
    icon: 'camera',
  },
  {
    id: 3,
    name: 'iPad Air M2',
    serialNumber: 'TBL-IPD-339',
    description: 'Tablet para apresentacoes e suporte em campo.',
    status: 'disponivel',
    icon: 'tablet',
  },
  {
    id: 4,
    name: 'Bose Noise Cancelling 700',
    serialNumber: 'AUD-BOS-110',
    description: 'Fone para reunioes e gravacoes.',
    status: 'emprestado',
    statusDetail: 'Vence hoje',
    icon: 'fone',
  },
];

@Component({
  selector: 'app-list-page',
  standalone: true,
  imports: [CommonModule, AppHeaderComponent, ItemModalComponent],
  templateUrl: './list-page.html',
  styleUrl: './list-page.scss',
})
export class ListPageComponent {
  readonly filterQuery = signal('');
  readonly showNewItemModal = signal(false);
  readonly items = signal<InventoryItem[]>(INITIAL_ITEMS);

  readonly filteredItems = computed(() => {
    const query = this.filterQuery().trim().toLowerCase();

    if (!query) {
      return this.items();
    }

    return this.items().filter((item) =>
      [item.name, item.serialNumber, item.description, this.getStatusLabel(item.status)]
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
    const nextItem: InventoryItem = {
      id: Date.now(),
      name: payload.name,
      serialNumber: this.generateSerialNumber(payload.status),
      description: payload.description,
      status: payload.status,
      statusDetail:
        payload.status === 'emprestado' ? 'Devolucao em 7 dias' : undefined,
      icon: this.pickIcon(payload.name),
    };

    this.items.update((items) => [nextItem, ...items]);
    this.showNewItemModal.set(false);
  }

  onClickDeleteItem(itemId: number): void {
    this.items.update((items) => items.filter((item) => item.id !== itemId));
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

  private generateSerialNumber(status: InventoryItemStatus): string {
    const prefix = status === 'disponivel' ? 'INV' : 'EMP';
    return `${prefix}-${String(this.items().length + 1).padStart(3, '0')}`;
  }

  private pickIcon(itemName: string): InventoryItemIcon {
    const normalizedName = itemName.toLowerCase();

    if (normalizedName.includes('camera') || normalizedName.includes('sony')) {
      return 'camera';
    }

    if (normalizedName.includes('ipad') || normalizedName.includes('tablet')) {
      return 'tablet';
    }

    if (normalizedName.includes('fone') || normalizedName.includes('headphone')) {
      return 'fone';
    }

    return 'notebook';
  }
}
