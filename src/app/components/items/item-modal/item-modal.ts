import { Component, inject, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { CreateInventoryItemPayload } from '../../../models/items/inventory-item.model';

@Component({
  selector: 'app-item-modal',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './item-modal.html',
  styleUrl: './item-modal.scss',
})
export class ItemModalComponent {
  private readonly formBuilder = inject(FormBuilder);

  readonly close = output<void>();
  readonly save = output<CreateInventoryItemPayload>();

  readonly form = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required]],
    description: ['', [Validators.required]],
    status: ['disponivel' as const, [Validators.required]],
  });

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
