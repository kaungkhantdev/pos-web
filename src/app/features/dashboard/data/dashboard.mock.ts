// TODO: replace with data/dashboard.service.ts → GET /api/dashboard
export interface Stat {
  label: string;
  value: string;
  icon?: string;
  svg?: string[];
  badge: string;
  badgeClass: string;
  trendUp?: boolean;
  link?: string;
}

export const STATS: Stat[] = [
  {
    label: "Today's Sales",
    value: '฿24,580',
    icon: 'hgi-money-bag-02',
    badge: '12.5%',
    badgeClass: 'text-[#00c066]',
    trendUp: true,
  },
  {
    label: 'Pending Kitchen Orders',
    value: '8',
    icon: 'hgi-fire',
    badge: 'In kitchen',
    badgeClass: 'text-amber-600',
    link: '/kitchen',
  },
  {
    label: 'Revenue (Month)',
    value: '฿612,940',
    icon: 'hgi-chart-line-data-02',
    badge: '5.4%',
    badgeClass: 'text-[#00c066]',
    trendUp: true,
  },
  {
    label: 'Tables Occupied',
    value: '5 / 15',
    badge: 'Live',
    badgeClass: 'text-[#00c066]',
    svg: ['M8 12a4 4 0 1 0 8 0a4 4 0 1 0-8 0', 'M12 4v2.6M12 17.4V20M4 12h2.6M17.4 12H20'],
  },
];

export type RevenueRange = 'week' | 'month' | 'year';

export interface RevenueData {
  labels: string[];
  values: number[]; // ฿k
  head: string;
  change: number;
  tip: string;
}

export const REVENUE: Record<RevenueRange, RevenueData> = {
  week: {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    values: [32, 38, 35, 41, 44, 52, 47],
    head: '฿8.42k',
    change: 12.5,
    tip: '฿52k',
  },
  month: {
    labels: ['W1', 'W2', 'W3', 'W4'],
    values: [34, 39, 43, 48],
    head: '฿19.6k',
    change: 12.5,
    tip: '฿48k',
  },
  year: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    values: [28, 30, 29, 31, 40, 38, 36, 42, 44, 43, 40, 52],
    head: '฿48.29k',
    change: 12.5,
    tip: '฿52k',
  },
};

export interface CategorySale {
  name: string;
  orders: number;
  color: string; // legend dot
  from: string; // gradient
  to: string;
}

export const CATEGORY_SALES: CategorySale[] = [
  { name: 'Main Course', orders: 563, color: '#00c066', from: '#5fe3a1', to: '#00c066' },
  { name: 'Sushi', orders: 322, color: '#4dd494', from: '#9eedc5', to: '#4dd494' },
  { name: 'Drinks', orders: 241, color: '#a6ecc8', from: '#d9f8e8', to: '#a6ecc8' },
  { name: 'Dessert', orders: 214, color: '#d1d5db', from: '#e7e9ed', to: '#d1d5db' },
];

export const LOW_STOCK = [
  { name: 'Green Tea Leaves', sku: 'SKU-0231', left: 3 },
  { name: 'Chicken Breast', sku: 'SKU-0119', left: 1 },
  { name: 'Coffee Beans', sku: 'SKU-0087', left: 5 },
  { name: 'Cooking Oil (5L)', sku: 'SKU-0154', left: 4 },
];

export type PaidStatus = 'paid' | 'refunded';

export const RECENT_ORDERS: {
  id: string;
  customer: string;
  amount: number;
  status: PaidStatus;
  time: string;
}[] = [
  { id: 'ORD-1042', customer: 'Walk-in', amount: 480, status: 'paid', time: '10:24' },
  { id: 'ORD-1041', customer: 'Anong P.', amount: 1250, status: 'paid', time: '10:02' },
  { id: 'ORD-1040', customer: 'Walk-in', amount: 90, status: 'refunded', time: '09:47' },
  { id: 'ORD-1039', customer: 'Somchai K.', amount: 760, status: 'paid', time: '09:30' },
];

export const POPULAR_ITEMS = [
  {
    name: 'Pad Thai',
    sold: 86,
    revenue: 9460,
    icon: 'hgi-noodles',
    tone: 'bg-[#00c066]/10 text-[#00994f]',
  },
  {
    name: 'Salmon Nigiri',
    sold: 72,
    revenue: 5760,
    icon: 'hgi-sushi-01',
    tone: 'bg-blue-50 text-blue-500',
  },
  {
    name: 'Iced Coffee',
    sold: 64,
    revenue: 3520,
    icon: 'hgi-coffee-02',
    tone: 'bg-amber-50 text-amber-500',
  },
  {
    name: 'Chicken Rice Set',
    sold: 58,
    revenue: 6960,
    icon: 'hgi-rice-bowl-01',
    tone: 'bg-[#00c066]/10 text-[#00994f]',
  },
];
