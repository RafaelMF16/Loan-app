import { Component, Input, OnInit, inject, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { CreateInventoryItemPayload, InventoryItem, InventoryItemStatus } from '../../../models/items/inventory-item.model';

@Component({
  selector: 'app-item-modal',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './item-modal.html',
  styleUrl: './item-modal.scss',
})
export class ItemModalComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);

  @Input() editItem?: InventoryItem;

  readonly close = output<void>();
  readonly save = output<CreateInventoryItemPayload>();

  readonly form = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required]],
    description: ['', [Validators.required]],
    status: ['disponivel' as InventoryItemStatus, [Validators.required]],
  });

  get isEditMode(): boolean {
    return !!this.editItem;
  }

  ngOnInit(): void {
    if (this.editItem) {
      this.form.setValue({
        name: this.editItem.name,
        description: this.editItem.description,
        status: this.editItem.status,
      });
    }
  }

  onClickCloseModal(): void {
    this.close.emit();
  }

  onClickSaveItem(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.save.emit(this.form.getRawValue());
  }
}
