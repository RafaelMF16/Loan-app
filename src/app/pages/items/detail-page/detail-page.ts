import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';

import { AppHeaderComponent } from '../../../components/shared/app-header/app-header';
import { InventoryItemStatus } from '../../../models/items/inventory-item.model';
import { InventoryItemsService } from '../../../services/items/inventory-items.service';

@Component({
  selector: 'app-detail-page',
  standalone: true,
  imports: [CommonModule, RouterLink, AppHeaderComponent],
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

  readonly item = computed(() =>
    this.inventoryItemsService.getItemById(this.itemId())
  );

  readonly itemReference = computed(() => {
    const item = this.item();
    return item ? `ITEM-${String(item.id).padStart(3, '0')}` : '';
  });

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
