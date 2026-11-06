import { DiningTable, Section, TableStatus } from './table.modal';

// TODO: replace with data/tables.service.ts
//   GET /api/tables, POST /api/tables,
//   POST /api/tables/{id}/transfer, /merge, /free
export const SECTIONS: { value: Section; label: string }[] = [
  { value: 'main_hall', label: 'Main Hall' },
  { value: 'terrace', label: 'Terrace' },
  { value: 'bar', label: 'Bar' },
  { value: 'private_room', label: 'Private Room' },
];

export const STATUS_STYLE: Record<
  TableStatus,
  { label: string; card: string; badge: string; dot: string; icon: string }
> = {
  available: {
    label: 'Available',
    card: 'border-green-200 bg-green-50/40',
    badge: 'bg-green-100 text-green-700',
    dot: 'bg-green-600',
    icon: 'hgi-checkmark-circle-02',
  },
  occupied: {
    label: 'Occupied',
    card: 'border-rose-200 bg-rose-50/40',
    badge: 'bg-rose-100 text-rose-700',
    dot: 'bg-rose-500',
    icon: 'hgi-user-multiple-02',
  },
  reserved: {
    label: 'Reserved',
    card: 'border-amber-200 bg-amber-50/50',
    badge: 'bg-amber-100 text-amber-700',
    dot: 'bg-amber-600',
    icon: 'hgi-calendar-03',
  },
  billing: {
    label: 'Billing',
    card: 'border-blue-200 bg-blue-50/50',
    badge: 'bg-blue-100 text-blue-700',
    dot: 'bg-blue-600',
    icon: 'hgi-invoice-03',
  },
};

const MIN = 60_000;

/** Seated times are relative to `now` so the minutes count up */
export function mockTables(now: number): DiningTable[] {
  const occ = (bill: number, mins: number, guests: number) =>
    ({ status: 'occupied', bill, seatedAt: now - mins * MIN, guests }) as const;
  const res = (time: string, name: string) =>
    ({ status: 'reserved', reservation: { time, name } }) as const;
  const free = { status: 'available' } as const;

  let id = 0;
  const t = (
    name: string,
    seats: number,
    section: Section,
    s: Partial<DiningTable>,
  ): DiningTable => ({ id: ++id, name, seats, section, status: 'available', ...s });

  return [
    t('T1', 2, 'main_hall', occ(480, 24, 2)),
    t('T2', 4, 'main_hall', free),
    t('T3', 4, 'main_hall', occ(1250, 41, 4)),
    t('T4', 2, 'main_hall', res('18:30', 'Anong P.')),
    t('T5', 6, 'main_hall', occ(860, 12, 5)),
    t('T6', 4, 'main_hall', free),
    t('T7', 2, 'main_hall', { status: 'billing', bill: 355, seatedAt: now - 52 * MIN, guests: 2 }),
    t('T8', 8, 'main_hall', free),
    t('T9', 4, 'main_hall', occ(640, 33, 3)),
    t('T10', 2, 'main_hall', free),
    t('T11', 4, 'main_hall', res('19:00', 'Somchai K.')),
    t('T12', 6, 'main_hall', occ(1980, 58, 6)),
    t('T13', 2, 'main_hall', free),
    t('T14', 4, 'main_hall', free),
    t('T15', 4, 'main_hall', free),
    t('P1', 4, 'terrace', free),
    t('P2', 4, 'terrace', occ(720, 18, 3)),
    t('P3', 2, 'terrace', free),
    t('P4', 6, 'terrace', free),
    t('Bar 1', 2, 'bar', free),
    t('Bar 2', 2, 'bar', occ(290, 9, 2)),
    t('Bar 3', 2, 'bar', free),
    t('VIP 1', 10, 'private_room', res('20:00', 'Krit T.')),
  ];
}
