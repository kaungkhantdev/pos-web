import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HeaderTools } from '../../../../shared/components/header-tools/header-tools';
import { Modal } from '../../../../shared/components/modal/modal';
import { ToastService } from '../../../../core/notify/toast.service';
import { ADJUST_REASONS, INGREDIENTS, MOVEMENT_TYPES, MOVEMENTS } from '../../data/inventory.mock';
import { AdjustReason, Ingredient, Movement, MovementType } from '../../data/inventory.modal';

type Tab = 'movements' | 'lowstock';

@Component({
  selector: 'app-inventory',
  imports: [ReactiveFormsModule, DatePipe, HeaderTools, Modal],
  templateUrl: './inventory.html',
  host: { class: 'block' },
})
export class Inventory {
  private fb = inject(FormBuilder).nonNullable;
  private toast = inject(ToastService);

  private userName = 'Somchai K.'; // TODO: from AuthService

  types = MOVEMENT_TYPES;
  reasons = ADJUST_REASONS;

  ingredients = signal<Ingredient[]>(INGREDIENTS);
  movements = signal<Movement[]>(MOVEMENTS);

  tab = signal<Tab>('movements');
  tabs: { key: Tab; label: string }[] = [
    { key: 'movements', label: 'Movement History' },
    { key: 'lowstock', label: 'Low-stock Ingredients' },
  ];

  // ---------- Derived ----------
  byId = computed(() => new Map(this.ingredients().map((i) => [i.id, i])));

  /** at or below reorder level, including out of stock; emptiest first */
  lowStock = computed(() =>
    this.ingredients()
      .filter((i) => i.onHand <= i.reorderLevel)
      .sort((a, b) => a.onHand / a.reorderLevel - b.onHand / b.reorderLevel),
  );

  stats = computed(() => {
    const all = this.ingredients();
    const out = all.filter((i) => i.onHand <= 0).length;
    return [
      { label: 'Total Ingredients', value: all.length, icon: 'hgi-package' },
      { label: 'Low Stock', value: this.lowStock().length - out, icon: 'hgi-alert-02' },
      { label: 'Out of Stock', value: out, icon: 'hgi-unavailable' },
    ];
  });

  /** red when empty or at 20% of reorder level or less, amber otherwise */
  levelClass(i: Ingredient) {
    return i.onHand <= 0 || i.onHand / i.reorderLevel <= 0.2
      ? 'bg-red-50 text-red-500'
      : 'bg-amber-50 text-amber-600';
  }

  // ---------- Stock in ----------
  stockInOpen = signal(false);
  stockInForm = this.fb.group({
    ingredientId: this.fb.control<number | null>(null, Validators.required),
    quantity: this.fb.control<number | null>(null, [Validators.required, Validators.min(0.01)]),
    note: ['', Validators.maxLength(120)],
  });

  openStockIn(ingredient?: Ingredient) {
    this.stockInForm.reset({ ingredientId: ingredient?.id ?? null, quantity: null, note: '' });
    this.stockInOpen.set(true);
  }

  saveStockIn() {
    if (this.stockInForm.invalid) {
      this.stockInForm.markAllAsTouched();
      return;
    }
    const { ingredientId, quantity, note } = this.stockInForm.getRawValue();
    // TODO: POST /api/stock-movements/stock-in
    this.record(ingredientId!, 'stock_in', quantity!, note.trim());
    this.stockInOpen.set(false);
    this.toast.success('Stock added', 'Inventory levels have been updated.');
  }

  // ---------- Adjust ----------
  adjustOpen = signal(false);
  adjustForm = this.fb.group({
    ingredientId: this.fb.control<number | null>(null, Validators.required),
    quantity: this.fb.control<number | null>(null, [Validators.required, Validators.min(0)]),
    reason: this.fb.control<AdjustReason>('count_correction', Validators.required),
  });

  openAdjust() {
    this.adjustForm.reset({ ingredientId: null, quantity: null, reason: 'count_correction' });
    this.adjustOpen.set(true);
  }

  /** counted − on hand, for the preview line */
  adjustDiff(): number | null {
    const { ingredientId, quantity } = this.adjustForm.getRawValue();
    const ing = ingredientId != null ? this.byId().get(ingredientId) : undefined;
    return ing && quantity != null ? quantity - ing.onHand : null;
  }

  saveAdjust() {
    if (this.adjustForm.invalid) {
      this.adjustForm.markAllAsTouched();
      return;
    }
    const diff = this.adjustDiff()!;
    if (diff === 0) {
      this.toast.info('No change', 'The counted quantity matches what is on hand.');
      return;
    }
    const { ingredientId, reason } = this.adjustForm.getRawValue();
    const label = this.reasons.find((r) => r.value === reason)!.label;
    // TODO: POST /api/stock-movements/adjust
    this.record(ingredientId!, 'adjustment', diff, label);
    this.adjustOpen.set(false);
    this.toast.warning('Stock adjusted', 'The adjustment has been recorded.');
  }

  // ---------- Shared ----------
  private record(ingredientId: number, type: MovementType, change: number, note: string) {
    const balance = (this.byId().get(ingredientId)?.onHand ?? 0) + change;
    this.ingredients.update((list) =>
      list.map((i) => (i.id === ingredientId ? { ...i, onHand: balance } : i)),
    );
    this.movements.update((list) => [
      {
        id: Math.max(0, ...list.map((m) => m.id)) + 1,
        ingredientId,
        type,
        change,
        balance,
        by: this.userName,
        at: new Date().toISOString(),
        note: note || undefined,
      },
      ...list,
    ]);
    this.tab.set('movements');
  }

  invalid(form: 'stockInForm' | 'adjustForm', name: string) {
    const c = (this[form] as FormGroup).get(name);
    return !!c && c.invalid && c.touched;
  }
}
