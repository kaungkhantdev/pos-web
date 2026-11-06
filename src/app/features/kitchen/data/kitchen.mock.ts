import { OrderType } from '../../../shared/enums/order-type';

// TODO: replace with data/kitchen.service.ts → GET /api/kitchen-tickets + live updates
export type TicketStatus = 'queued' | 'preparing' | 'ready' | 'completed';

export interface TicketItem {
  qty: number;
  name: string;
  note?: string;
}

export interface Ticket {
  id: string;
  type: OrderType;
  ref: string; // table for dine-in, pickup / delivery code otherwise
  status: TicketStatus;
  items: TicketItem[];
  createdAt: number;
  startedAt?: number;
  servedAt?: number;
}

const MIN = 60_000;

/** Times are relative to `now` so the timers run */
export function mockTickets(now: number): Ticket[] {
  return [
    {
      id: 'KOT-1046',
      type: 'dine_in',
      ref: 'T5',
      status: 'queued',
      createdAt: now - 10_000,
      items: [
        { qty: 1, name: 'Tom Yum Goong', note: 'Extra spicy' },
        { qty: 2, name: 'Jasmine Rice' },
        { qty: 1, name: 'Pad Thai', note: 'No peanuts' },
      ],
    },
    {
      id: 'KOT-1045',
      type: 'takeaway',
      ref: 'A-231',
      status: 'queued',
      createdAt: now - 80_000,
      items: [
        { qty: 1, name: 'Green Curry', note: 'Less spicy · No bamboo' },
        { qty: 1, name: 'Iced Coffee', note: 'Extra sweet' },
      ],
    },
    {
      id: 'KOT-1044',
      type: 'dine_in',
      ref: 'T3',
      status: 'preparing',
      createdAt: now - 6 * MIN,
      startedAt: now - 277_000,
      items: [
        { qty: 2, name: 'Salmon Nigiri' },
        { qty: 1, name: 'Caesar Salad', note: 'No croutons' },
        { qty: 1, name: 'Miso Soup' },
      ],
    },
    {
      id: 'KOT-1042',
      type: 'dine_in',
      ref: 'T1',
      status: 'preparing',
      createdAt: now - 10 * MIN,
      startedAt: now - 492_000,
      items: [
        { qty: 2, name: 'Pad Thai', note: 'No peanuts · Extra shrimp' },
        { qty: 1, name: 'Spring Rolls' },
      ],
    },
    {
      id: 'KOT-1043',
      type: 'delivery',
      ref: 'D-118',
      status: 'preparing',
      createdAt: now - 7 * MIN,
      startedAt: now - 363_000,
      items: [
        { qty: 1, name: 'Chicken Rice Set', note: 'No cucumber' },
        { qty: 1, name: 'Matcha Ice Cream' },
      ],
    },
    {
      id: 'KOT-1041',
      type: 'dine_in',
      ref: 'T9',
      status: 'ready',
      createdAt: now - 15 * MIN,
      items: [
        { qty: 1, name: 'Beef Noodle Soup' },
        { qty: 2, name: 'Iced Tea' },
      ],
    },
    {
      id: 'KOT-1040',
      type: 'takeaway',
      ref: 'A-230',
      status: 'ready',
      createdAt: now - 14 * MIN,
      items: [{ qty: 3, name: 'Chicken Satay', note: 'Extra peanut sauce' }],
    },
    {
      id: 'KOT-1039',
      type: 'dine_in',
      ref: 'T2',
      status: 'completed',
      createdAt: now - 40 * MIN,
      servedAt: now - 29 * MIN,
      items: [
        { qty: 2, name: 'Green Curry' },
        { qty: 2, name: 'Jasmine Rice' },
      ],
    },
    {
      id: 'KOT-1038',
      type: 'delivery',
      ref: 'D-116',
      status: 'completed',
      createdAt: now - 45 * MIN,
      servedAt: now - 37 * MIN,
      items: [{ qty: 1, name: 'Pad Thai' }],
    },
  ];
}
