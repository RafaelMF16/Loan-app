import { Component, Input, inject, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { InventoryItem } from '../../../models/items/inventory-item.model';
import { CreateLoanPayload } from '../../../models/loans/loan.model';

@Component({
  selector: 'app-loan-modal',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './loan-modal.html',
  styleUrl: './loan-modal.scss',
})
export class LoanModalComponent {
  private readonly formBuilder = inject(FormBuilder);

  @Input({ required: true }) item!: InventoryItem;

  readonly close = output<void>();
  readonly save = output<CreateLoanPayload>();

  readonly today = new Date().toISOString().split('T')[0];

  readonly form = this.formBuilder.nonNullable.group({
    borrowerName: ['', [Validators.required]],
    borrowerEmail: ['', [Validators.email]],
    borrowerContact: [''],
    expectedReturnDate: [''],
    notes: [''],
  });

  onClickCloseModal(): void {
    this.close.emit();
  }

  onClickSaveLoan(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const payload: CreateLoanPayload = {
      itemId: this.item.id,
      borrowerName: raw.borrowerName,
      borrowerEmail: raw.borrowerEmail || undefined,
      borrowerContact: raw.borrowerContact || undefined,
      expectedReturnDate: raw.expectedReturnDate || undefined,
      notes: raw.notes || undefined,
    };

    this.save.emit(payload);
  }
}
