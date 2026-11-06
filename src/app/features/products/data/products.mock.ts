import { CATEGORIES } from '../../categories/data/categories.mock';
import { Product, StockLevel } from './product.model';

// TODO: replace with data/products.service.ts
//   GET/POST/PUT/DELETE /api/products, PATCH /api/products/{id}/availability,
//   categories from a shared CategoryService instead of the categories mock
export const CATEGORY_OPTIONS = CATEGORIES.map((c) => ({ id: c.id, name: c.name }));

export const LOW_STOCK_AT = 5;
export const CRITICAL_STOCK_AT = 2;
export const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

export function stockLevel(stock: number): StockLevel {
  if (stock <= 0) return 'out';
  if (stock <= CRITICAL_STOCK_AT) return 'critical';
  if (stock <= LOW_STOCK_AT) return 'low';
  return 'ok';
}

export const STOCK_BADGE: Record<StockLevel, string> = {
  out: 'bg-red-50 text-red-500',
  critical: 'bg-red-50 text-red-500',
  low: 'bg-amber-50 text-amber-600',
  ok: 'bg-green-50 text-green-600',
};

const p = (
  id: number,
  name: string,
  sku: string,
  barcode: string,
  categoryId: number,
  price: number,
  stock: number,
  available = true,
  modifiers: string[] = [],
): Product => ({
  id,
  name,
  sku,
  barcode,
  categoryId,
  price,
  stock,
  available,
  modifiers,
  image: null,
});

export const PRODUCTS: Product[] = [
  p(1, 'Chicken Rice Set', 'SKU-0119', '885001234567', 1, 120, 1, true, [
    'No cucumber',
    'Extra spicy',
  ]),
  p(2, 'Salmon Nigiri', 'SKU-0202', '885001987654', 2, 80, 36),
  p(3, 'Iced Coffee', 'SKU-0087', '885003456789', 3, 55, 5, false, ['Extra sweet', 'Less ice']),
  p(4, 'Pad Thai', 'SKU-0101', '885001234568', 1, 110, 24, true, ['No peanuts', 'Extra shrimp']),
  p(5, 'Green Curry', 'SKU-0104', '885001234571', 1, 120, 18, true, ['Less spicy', 'No bamboo']),
  p(6, 'Makizushi', 'SKU-0205', '885001987657', 2, 140, 12),
  p(7, 'Iced Tea', 'SKU-0090', '885003456792', 3, 45, 40),
  p(8, 'Mango Sticky Rice', 'SKU-0301', '885004567890', 4, 120, 0, false),
  p(9, 'Caesar Salad', 'SKU-0401', '885005678901', 5, 150, 9, true, [
    'No croutons',
    'Dressing on the side',
  ]),
];
