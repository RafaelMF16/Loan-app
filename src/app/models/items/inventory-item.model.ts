export type InventoryItemStatus = 'disponivel' | 'emprestado';

export type InventoryItemIcon = 'notebook' | 'camera' | 'tablet' | 'fone';

export interface InventoryItem {
  id: number;
  name: string;
  description: string;
  status: InventoryItemStatus;
  statusDetail?: string;
  icon: InventoryItemIcon;
}

export interface CreateInventoryItemPayload {
  name: string;
  description: string;
  status: InventoryItemStatus;
}
