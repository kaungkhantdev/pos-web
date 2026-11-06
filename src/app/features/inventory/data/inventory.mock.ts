import { AdjustReason, Ingredient, Movement, MovementType } from './inventory.modal';

// TODO: replace with data/inventory.service.ts
//   GET /api/ingredients, GET /api/stock-movements,
//   POST /api/stock-movements/stock-in, POST /api/stock-movements/adjust
export const INGREDIENTS: Ingredient[] = [
  { id: 1, name: 'Chicken Breast', sku: 'SKU-0119', unit: 'kg', onHand: 1, reorderLevel: 10 },
  { id: 2, name: 'Green Tea Leaves', sku: 'SKU-0231', unit: 'kg', onHand: 3, reorderLevel: 12 },
  { id: 3, name: 'Coffee Beans', sku: 'SKU-0087', unit: 'kg', onHand: 5, reorderLevel: 15 },
  { id: 4, name: 'Salmon Fillet', sku: 'SKU-0042', unit: 'kg', onHand: 36, reorderLevel: 20 },
  { id: 5, name: 'Cooking Oil (5L)', sku: 'SKU-0154', unit: 'btl', onHand: 4, reorderLevel: 6 },
  { id: 6, name: 'Jasmine Rice', sku: 'SKU-0010', unit: 'kg', onHand: 0, reorderLevel: 25 },
  { id: 7, name: 'Coconut Milk', sku: 'SKU-0063', unit: 'can', onHand: 0, reorderLevel: 24 },
  { id: 8, name: 'Rice Noodles', sku: 'SKU-0071', unit: 'kg', onHand: 18, reorderLevel: 10 },
];

export const MOVEMENTS: Movement[] = [
  {
    id: 3,
    ingredientId: 3,
    type: 'sale',
    change: -3,
    balance: 5,
    by: 'Cashier 1',
    at: '2026-07-07T10:24:00',
  },
  {
    id: 2,
    ingredientId: 4,
    type: 'stock_in',
    change: 40,
    balance: 36,
    by: 'Admin',
    at: '2026-07-07T09:12:00',
    note: 'Supplier delivery',
  },
  {
    id: 1,
    ingredientId: 1,
    type: 'adjustment',
    change: -2,
    balance: 1,
    by: 'Admin',
    at: '2026-07-06T18:40:00',
    note: 'Damaged',
  },
];

export const MOVEMENT_TYPES: Record<MovementType, { label: string; badge: string }> = {
  stock_in: { label: 'Stock In', badge: 'bg-green-50 text-green-600' },
  sale: { label: 'Sale', badge: 'bg-blue-50 text-blue-600' },
  adjustment: { label: 'Adjustment', badge: 'bg-amber-50 text-amber-600' },
};

export const ADJUST_REASONS: { value: AdjustReason; label: string }[] = [
  { value: 'damaged', label: 'Damaged' },
  { value: 'expired', label: 'Expired' },
  { value: 'count_correction', label: 'Stock count correction' },
  { value: 'theft_loss', label: 'Theft / Loss' },
];
