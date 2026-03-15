import { Injectable, signal } from '@angular/core';

import {
  CreateInventoryItemPayload,
  InventoryItem,
  InventoryItemIcon,
} from '../../models/items/inventory-item.model';

const INITIAL_ITEMS: InventoryItem[] = [
  {
    id: 1,
    name: 'MacBook Pro 14" (M2)',
    description:
      'Ultima revisao tecnica em setembro/2023. Bateria em bom estado (94%). Pequeno risco na tampa superior perto do logo.',
    status: 'emprestado',
    statusDetail: 'Devolucao em 3 dias',
    icon: 'notebook',
  },
  {
    id: 2,
    name: 'Sony Alpha A7 IV',
    description:
      'Camera full-frame pronta para producao audiovisual, com sensor revisado e kit padrao completo.',
    status: 'disponivel',
    icon: 'camera',
  },
  {
    id: 3,
    name: 'iPad Air M2',
    description:
      'Tablet para apresentacoes, check-ins em eventos e apoio ao time comercial em campo.',
    status: 'disponivel',
    icon: 'tablet',
  },
  {
    id: 4,
    name: 'Bose Noise Cancelling 700',
    description:
      'Fone com cancelamento de ruido para reunioes, gravacoes e uso em ambientes compartilhados.',
    status: 'emprestado',
    statusDetail: 'Vence hoje',
    icon: 'fone',
  },
];

@Injectable({ providedIn: 'root' })
export class InventoryItemsService {
  private readonly itemsState = signal<InventoryItem[]>(INITIAL_ITEMS);

  readonly items = this.itemsState.asReadonly();

  getItemById(itemId: number): InventoryItem | undefined {
    return this.itemsState().find((item) => item.id === itemId);
  }

  addItem(payload: CreateInventoryItemPayload): void {
    const nextItem: InventoryItem = {
      id: Date.now(),
      name: payload.name,
      description: payload.description,
      status: payload.status,
      statusDetail:
        payload.status === 'emprestado' ? 'Devolucao em 7 dias' : undefined,
      icon: this.pickIcon(payload.name),
    };

    this.itemsState.update((items) => [nextItem, ...items]);
  }

  deleteItem(itemId: number): void {
    this.itemsState.update((items) => items.filter((item) => item.id !== itemId));
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
