export type TableStatus = 'available' | 'occupied' | 'reserved' | 'billing';
export type Section = 'main_hall' | 'terrace' | 'bar' | 'private_room';

export interface DiningTable {
  id: number;
  name: string;
  seats: number;
  section: Section;
  status: TableStatus;
  guests?: number;
  bill?: number;
  seatedAt?: number; // ms timestamp
  reservation?: { time: string; name: string };
  mergedInto?: number; // id of the table holding the shared bill
}
