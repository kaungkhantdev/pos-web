export interface Ingredient {
  id: number;
  name: string;
  sku: string;
  unit: string; // kg, L, pcs…
  onHand: number;
  reorderLevel: number;
}

export type MovementType = 'stock_in' | 'sale' | 'adjustment';
export type AdjustReason = 'damaged' | 'expired' | 'count_correction' | 'theft_loss';

export interface Movement {
  id: number;
  ingredientId: number;
  type: MovementType;
  change: number; // +40, -3
  balance: number; // on hand after this movement
  by: string;
  at: string; // ISO
  note?: string;
}
