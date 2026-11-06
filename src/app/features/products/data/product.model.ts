export interface Product {
  id: number;
  name: string;
  sku: string;
  barcode: string;
  categoryId: number;
  price: number;
  stock: number;
  available: boolean;
  modifiers: string[];
  image: string | null;   // URL from the API (data URL in the mock)
}

export type StockLevel = 'out' | 'critical' | 'low' | 'ok';
