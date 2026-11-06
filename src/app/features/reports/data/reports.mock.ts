// TODO: replace with data/reports.service.ts → GET /api/reports/{type}?from=&to=
export type ReportType = 'daily' | 'monthly' | 'menu' | 'staff' | 'ingredients' | 'profit';
export type Period = 'today' | 'week' | 'month' | 'year';
export type ReportSection = 'overview' | 'top' | 'products' | 'staff' | 'ingredients' | 'profit';

export const REPORT_TYPES: { key: ReportType; label: string; icon: string }[] = [
  { key: 'daily', label: 'Daily Sales', icon: 'hgi-calendar-03' },
  { key: 'monthly', label: 'Monthly Sales', icon: 'hgi-calendar-04' },
  { key: 'menu', label: 'Menu Sales', icon: 'hgi-restaurant-01' },
  { key: 'staff', label: 'Staff Sales', icon: 'hgi-user-multiple-02' },
  { key: 'ingredients', label: 'Ingredient Usage', icon: 'hgi-package' },
  { key: 'profit', label: 'Profit', icon: 'hgi-coins-01' },
];

/** which sections each report shows */
export const LAYOUT: Record<ReportType, ReportSection[]> = {
  daily: ['overview', 'top', 'ingredients'],
  monthly: ['overview', 'top'],
  menu: ['products'],
  staff: ['staff'],
  ingredients: ['ingredients'],
  profit: ['profit'],
};

export const PERIODS: { key: Period; label: string; compare: string }[] = [
  { key: 'month', label: 'This Month', compare: 'vs last month' },
  { key: 'today', label: 'Today', compare: 'vs yesterday' },
  { key: 'week', label: 'This Week', compare: 'vs last week' },
  { key: 'year', label: 'This Year', compare: 'vs last year' },
];

export interface Summary {
  gross: number;
  grossChange: number; // % vs previous period
  profitChange: number;
  orders: number;
  ordersChange: number;
  avgChange: number;
}

export const SUMMARY: Record<Period, Summary> = {
  today: {
    gross: 24580,
    grossChange: 12.5,
    profitChange: 2.4,
    orders: 146,
    ordersChange: 6.0,
    avgChange: 4.1,
  },
  week: {
    gross: 168400,
    grossChange: 7.2,
    profitChange: 4.8,
    orders: 1036,
    ordersChange: 5.5,
    avgChange: 1.6,
  },
  month: {
    gross: 612940,
    grossChange: 5.4,
    profitChange: 3.1,
    orders: 3842,
    ordersChange: 8.1,
    avgChange: -1.2,
  },
  year: {
    gross: 6840200,
    grossChange: 14.9,
    profitChange: 11.2,
    orders: 43120,
    ordersChange: 12.7,
    avgChange: 1.9,
  },
};

export const DAILY_TREND = {
  badge: 'Daily sales · Last 7 days',
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  values: [13500, 19500, 16500, 27000, 21000, 24000, 18000],
};

export const MONTHLY_TREND = {
  badge: 'Monthly sales · This year',
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  values: [
    480200, 512400, 498100, 530600, 601300, 575800, 612940, 588000, 556400, 571900, 598300, 614300,
  ],
};

// Month figures; other periods are scaled from these
export const PRODUCTS = [
  { name: 'Chicken Rice Set', units: 412, revenue: 49440 },
  { name: 'Salmon Nigiri', units: 388, revenue: 31040 },
  { name: 'Iced Coffee', units: 356, revenue: 19580 },
  { name: 'Pad Thai', units: 301, revenue: 33110 },
  { name: 'Green Curry', units: 264, revenue: 31680 },
  { name: 'Spring Rolls', units: 240, revenue: 21600 },
  { name: 'Tom Yum Goong', units: 198, revenue: 27720 },
  { name: 'Mango Sticky Rice', units: 152, revenue: 18240 },
];

export const STAFF = [
  { name: 'Nok Phan', role: 'Cashier', orders: 642, sales: 98240 },
  { name: 'Aran Kit', role: 'Waiter', orders: 518, sales: 82910 },
  { name: 'Mali Thong', role: 'Cashier', orders: 476, sales: 71330 },
  { name: 'Ploy Suk', role: 'Waiter', orders: 402, sales: 64150 },
  { name: 'Dao Rung', role: 'Cashier', orders: 288, sales: 45870 },
];

export const INGREDIENT_USAGE = [
  { name: 'Chicken Breast', used: 128, unit: 'kg', cost: 12800 },
  { name: 'Salmon Fillet', used: 76, unit: 'kg', cost: 22800 },
  { name: 'Coffee Beans', used: 54, unit: 'kg', cost: 9720 },
  { name: 'Jasmine Rice', used: 210, unit: 'kg', cost: 8400 },
];

/** costs other than ingredients (month); ingredient cost comes from INGREDIENT_USAGE */
export const OTHER_COSTS = [
  { label: 'Staff wages', amount: 210000, color: 'bg-[#1b1b1d]' },
  { label: 'Rent & utilities', amount: 120000, color: 'bg-amber-400' },
  { label: 'Other expenses', amount: 45100, color: 'bg-gray-300' },
];
