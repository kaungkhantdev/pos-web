import { OrderType } from '../../../shared/enums/order-type';

export type OrderStatus = 'open' | 'preparing' | 'ready' | 'served' | 'paid';

export interface OrderLine {
  name: string;
  qty: number;
  price: number;
  note?: string;
}

export interface Order {
  id: string;
  type: OrderType;
  table?: string; // dine-in
  ref?: string; // takeaway / delivery code (A-231, D-118)
  customer?: string;
  status: OrderStatus;
  lines: OrderLine[];
  createdAt: string; // ISO
}
