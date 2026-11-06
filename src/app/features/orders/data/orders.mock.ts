import { OrderType } from '../../../shared/enums/order-type';
import { Order, OrderLine, OrderStatus } from './order.model';

// TODO: replace with data/orders.service.ts
//   GET /api/orders?type=&status=&q=&page=, PATCH /api/orders/{id}/status
export const TAX_PERCENT = 7; // same as POS; move to a shared constant when the API returns it

export const STATUS_STYLE: Record<OrderStatus, { label: string; badge: string; active: string }> = {
  open: { label: 'Open', badge: 'bg-gray-100 text-gray-500', active: 'bg-gray-500' },
  preparing: { label: 'Preparing', badge: 'bg-amber-50 text-amber-600', active: 'bg-amber-500' },
  ready: { label: 'Ready', badge: 'bg-blue-50 text-blue-600', active: 'bg-blue-500' },
  served: { label: 'Served', badge: 'bg-indigo-50 text-indigo-600', active: 'bg-indigo-500' },
  paid: { label: 'Paid', badge: 'bg-green-50 text-green-600', active: 'bg-green-600' },
};

/** icons are the kit's own SVGs */
export const TYPE_STYLE: Record<OrderType, { badge: string; paths: string[] }> = {
  dine_in: {
    badge: 'bg-blue-50 text-blue-600',
    paths: ['M4 12a8 8 0 1 0 16 0a8 8 0 1 0-16 0', 'M9 12a3 3 0 1 0 6 0a3 3 0 1 0-6 0'],
  },
  takeaway: {
    badge: 'bg-amber-50 text-amber-600',
    paths: ['M6 8h12l-1 11H7L6 8Z', 'M9 8V6.5a3 3 0 0 1 6 0V8'],
  },
  delivery: {
    badge: 'bg-purple-50 text-purple-600',
    paths: [
      'M4 17a2 2 0 1 0 4 0a2 2 0 1 0-4 0',
      'M15 17a2 2 0 1 0 4 0a2 2 0 1 0-4 0',
      'M8 17h7M4 8h6l2 7M14 10h4l2 4v3h-1',
    ],
  },
};

const at = (h: number, m: number) => {
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.toISOString();
};
const l = (name: string, qty: number, price: number, note?: string): OrderLine => ({
  name,
  qty,
  price,
  note,
});
const o = (
  id: string,
  type: OrderType,
  where: Partial<Order>,
  status: OrderStatus,
  time: [number, number],
  lines: OrderLine[],
): Order => ({ id, type, status, lines, createdAt: at(...time), ...where });

export const ORDERS: Order[] = [
  o(
    'ORD-1042',
    'dine_in',
    { table: 'T1' },
    'preparing',
    [10, 24],
    [
      l('Pad Thai', 2, 110, 'No peanuts · Extra shrimp'),
      l('Spring Rolls', 1, 90),
      l('Iced Coffee', 2, 55, 'Extra sweet'),
    ],
  ),
  o(
    'ORD-1041',
    'dine_in',
    { table: 'T3', customer: 'Anong P.' },
    'served',
    [10, 2],
    [
      l('Salmon Nigiri', 2, 160),
      l('Green Curry', 2, 180),
      l('Jasmine Rice', 2, 30),
      l('Iced Tea', 2, 45),
      l('Mango Sticky Rice', 2, 120),
    ],
  ),
  o(
    'ORD-1040',
    'takeaway',
    { ref: 'A-231' },
    'ready',
    [9, 58],
    [l('Green Curry', 1, 120, 'Less spicy'), l('Iced Coffee', 1, 55)],
  ),
  o(
    'ORD-1039',
    'delivery',
    { ref: 'D-118', customer: 'Anong P.' },
    'preparing',
    [9, 47],
    [
      l('Chicken Rice Set', 2, 120, 'No cucumber'),
      l('Tom Yum Goong', 1, 280),
      l('Matcha Ice Cream', 1, 120),
    ],
  ),
  o(
    'ORD-1038',
    'dine_in',
    { table: 'T5' },
    'open',
    [9, 40],
    [l('Okonomiyaki', 2, 210), l('Yakitori', 2, 160), l('Miso Soup', 1, 80)],
  ),
  o(
    'ORD-1037',
    'takeaway',
    { ref: 'A-230' },
    'paid',
    [9, 32],
    [l('Chicken Satay', 2, 95, 'Extra peanut sauce'), l('Iced Tea', 1, 100)],
  ),
  o(
    'ORD-1036',
    'delivery',
    { ref: 'D-117', customer: 'Somchai K.' },
    'paid',
    [9, 20],
    [l('Pad Thai', 2, 155)],
  ),
  o(
    'ORD-1035',
    'dine_in',
    { table: 'T9' },
    'paid',
    [9, 5],
    [l('Beef Noodle Soup', 2, 150), l('Iced Tea', 2, 45)],
  ),
  o('ORD-1034', 'takeaway', { ref: 'A-229' }, 'paid', [8, 51], [l('Curry Rice', 1, 200)]),
  o(
    'ORD-1033',
    'dine_in',
    { table: 'T12', customer: 'Krit T.' },
    'paid',
    [8, 30],
    [l('Sashimi', 3, 180), l('Makizushi', 2, 140), l('Ramen', 2, 150)],
  ),
  o(
    'ORD-1032',
    'delivery',
    { ref: 'D-116' },
    'paid',
    [8, 12],
    [l('Pad Thai', 1, 110), l('Spring Rolls', 1, 90)],
  ),
];
