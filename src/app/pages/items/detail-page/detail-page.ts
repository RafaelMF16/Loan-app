import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { EMPTY, switchMap, catchError, filter } from 'rxjs';
import { map } from 'rxjs';

import { AppHeaderComponent } from '../../../components/shared/app-header/app-header';
import { ItemModalComponent } from '../../../components/items/item-modal/item-modal';
import { CreateInventoryItemPayload, InventoryItemStatus } from '../../../models/items/inventory-item.model';
import { InventoryItemsService } from '../../../services/items/inventory-items.service';

@Component({
  selector: 'app-detail-page',
  standalone: true,
  imports: [CommonModule, RouterLink, AppHeaderComponent, ItemModalComponent],
  templateUrl: './detail-page.html',
  styleUrl: './detail-page.scss',
})
export class DetailPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly inventoryItemsService = inject(InventoryItemsService);

  private readonly itemId = toSignal(
    this.route.paramMap.pipe(map((params) => Number(params.get('id')))),
    { initialValue: 0 }
  );
  private readonly refreshCounter = signal(0);

  readonly item = toSignal(
    toObservable(computed(() => ({ id: this.itemId(), _r: this.refreshCounter() }))).pipe(
      filter(({ id }) => id > 0),
      switchMap(({ id }) =>
        this.inventoryItemsService.fetchById(id).pipe(catchError(() => EMPTY))
      )
    )
  );

  readonly showEditModal = signal(false);

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
        this.showEditModal.set(false);
        this.refreshCounter.update((n) => n + 1);
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
