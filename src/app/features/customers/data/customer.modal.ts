import { OrderType } from '../../../shared/enums/order-type';

export interface Customer {
  id: number;
  name: string;
  phone: string;
  email: string;
  orderCount: number;
  totalSpent: number;
  points: number;
  lastVisit: string | null; // ISO
}

export type CustomerInput = Pick<Customer, 'name' | 'phone' | 'email'>;

export interface CustomerOrder {
  id: string;
  customerId: number;
  at: string;
  type: OrderType;
  items: number;
  total: number;
}

export type Tier = 'bronze' | 'silver' | 'gold';
