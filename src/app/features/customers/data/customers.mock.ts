import { Customer, CustomerOrder, Tier } from './customer.modal';

// TODO: replace with data/customers.service.ts
//   GET/POST/PUT/DELETE /api/customers, GET /api/customers/{id}/orders
export const CUSTOMERS: Customer[] = [
  {
    id: 1,
    name: 'Anong Prasert',
    phone: '081-234-5678',
    email: 'anong@email.com',
    orderCount: 24,
    totalSpent: 18420,
    points: 1240,
    lastVisit: '2026-07-07',
  },
  {
    id: 2,
    name: 'Somchai Kaew',
    phone: '089-876-5432',
    email: 'somchai@email.com',
    orderCount: 12,
    totalSpent: 7690,
    points: 530,
    lastVisit: '2026-07-05',
  },
  {
    id: 3,
    name: 'Malee Wong',
    phone: '062-555-0192',
    email: '',
    orderCount: 5,
    totalSpent: 2310,
    points: 231,
    lastVisit: '2026-06-30',
  },
  {
    id: 4,
    name: 'Krit Thongchai',
    phone: '095-118-7720',
    email: 'krit.t@email.com',
    orderCount: 31,
    totalSpent: 26150,
    points: 2615,
    lastVisit: '2026-07-06',
  },
];

export const CUSTOMER_ORDERS: CustomerOrder[] = [
  {
    id: 'ORD-1041',
    customerId: 1,
    at: '2026-07-07T10:02:00',
    type: 'dine_in',
    items: 6,
    total: 1250,
  },
  {
    id: 'ORD-0998',
    customerId: 1,
    at: '2026-06-28T19:15:00',
    type: 'takeaway',
    items: 3,
    total: 640,
  },
  {
    id: 'ORD-0954',
    customerId: 1,
    at: '2026-06-19T12:40:00',
    type: 'delivery',
    items: 5,
    total: 980,
  },
  {
    id: 'ORD-1039',
    customerId: 2,
    at: '2026-07-05T09:30:00',
    type: 'dine_in',
    items: 4,
    total: 760,
  },
  {
    id: 'ORD-1036',
    customerId: 4,
    at: '2026-07-06T20:10:00',
    type: 'dine_in',
    items: 8,
    total: 2140,
  },
];

/** 1 point per ฿10 spent; check the real rule with the backend */
export const POINTS_PER_BAHT = 0.1;

export const TIERS: Record<Tier, { label: string; min: number; badge: string }> = {
  bronze: { label: 'Bronze', min: 0, badge: 'text-orange-700' },
  silver: { label: 'Silver', min: 500, badge: 'text-gray-500' },
  gold: { label: 'Gold', min: 1000, badge: 'text-amber-600' },
};

export function tierOf(points: number): Tier {
  return points >= TIERS.gold.min ? 'gold' : points >= TIERS.silver.min ? 'silver' : 'bronze';
}
