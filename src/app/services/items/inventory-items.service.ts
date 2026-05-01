import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

import {
  CreateInventoryItemPayload,
  InventoryItem,
  InventoryItemIcon,
  PaginatedItems,
} from '../../models/items/inventory-item.model';
import { RequestService } from '../request/request.service';

const EMPTY_PAGE: PaginatedItems = { data: [], total: 0, page: 1, totalPages: 1, perPage: 10 };

@Injectable({ providedIn: 'root' })
export class InventoryItemsService {
  private readonly requestService = inject(RequestService);
  private readonly paginationState = signal<PaginatedItems>(EMPTY_PAGE);
  private readonly currentSearch = signal('');
  private readonly searchSubject = new Subject<string>();

  readonly pagination = this.paginationState.asReadonly();
  readonly items = computed(() => this.paginationState().data);

  constructor() {
    this.searchSubject.pipe(debounceTime(300)).subscribe((search) => {
      this.currentSearch.set(search);
      this.loadPage(1, search);
    });

    this.loadPage(1);
  }

  loadPage(page: number, search = this.currentSearch()): void {
    const params = `?page=${page}&search=${encodeURIComponent(search)}`;
    this.requestService.get<PaginatedItems>(`/items${params}`).subscribe({
      next: (result) => this.paginationState.set(result),
    });
  }

  search(query: string): void {
    this.searchSubject.next(query);
  }

  fetchById(id: number): Observable<InventoryItem> {
    return this.requestService.get<InventoryItem>(`/items/${id}`);
  }

  updateItem(id: number, payload: CreateInventoryItemPayload): Observable<InventoryItem> {
    return this.requestService.put<InventoryItem>(`/items/${id}`, {
      ...payload,
      icon: this.pickIcon(payload.name),
    });
  }

  addItem(payload: CreateInventoryItemPayload): void {
    this.requestService
      .post<InventoryItem>('/items', { ...payload, icon: this.pickIcon(payload.name) })
      .subscribe({
        next: () => this.loadPage(1),
      });
  }

  deleteItem(itemId: number): void {
    this.requestService.delete<void>(`/items/${itemId}`).subscribe({
      next: () => this.loadPage(this.paginationState().page),
    });
  }

  private pickIcon(itemName: string): InventoryItemIcon {
    const name = itemName.toLowerCase();
    if (name.includes('camera') || name.includes('sony')) return 'camera';
    if (name.includes('ipad') || name.includes('tablet')) return 'tablet';
    if (name.includes('fone') || name.includes('headphone')) return 'fone';
    return 'notebook';
  }
}
