export interface NavItem {
  label: string;
  link: string;
  icon?: string; // hugeicons class
  svg?: string[]; // custom icon paths (24×24, stroke)
}

export const MAIN_NAV: NavItem[] = [
  { label: 'Dashboard', link: '/dashboard', icon: 'hgi-home-01' },
  { label: 'POS', link: '/pos', icon: 'hgi-shopping-cart-01' },
  {
    label: 'Tables',
    link: '/tables',
    svg: ['M8 12a4 4 0 1 0 8 0a4 4 0 1 0-8 0', 'M12 4v2.6M12 17.4V20M4 12h2.6M17.4 12H20'],
  },
  { label: 'Orders', link: '/orders', icon: 'hgi-invoice-03' },
  {
    label: 'Kitchen',
    link: '/kitchen',
    svg: [
      'M7 14.5h10V19a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 7 19v-4.5Z',
      'M17 14.5a3.8 3.8 0 0 0 .9-7.5A4.3 4.3 0 0 0 9 5.3 3.4 3.4 0 0 0 7 14.5',
      'M7 17.5h10',
    ],
  },
  { label: 'Reports', link: '/reports', icon: 'hgi-analytics-up' },
  {
    label: 'Menu Items',
    link: '/products',
    svg: [
      'M4 5a2 2 0 0 1 2-2h5v18H6a2 2 0 0 1-2-2V5Z',
      'M20 5a2 2 0 0 0-2-2h-5v18h5a2 2 0 0 0 2-2V5Z',
      'M7 7.5h1.5M7 10.5h1.5M15.5 7.5H17M15.5 10.5H17',
    ],
  },
  {
    label: 'Menu Categories',
    link: '/categories',
    svg: [
      'M20.59 13.41 13.42 20.58a2 2 0 0 1-2.83 0L2 12V4a2 2 0 0 1 2-2h8l8.59 8.59a2 2 0 0 1 0 2.82Z',
      'M6.2 7.5a1.3 1.3 0 1 0 2.6 0a1.3 1.3 0 1 0-2.6 0',
    ],
  },
  { label: 'Ingredients', link: '/inventory', icon: 'hgi-package-search' },
  { label: 'Customers', link: '/customers', icon: 'hgi-user-multiple-02' },
  { label: 'Staff', link: '/users', icon: 'hgi-user-settings-01' },
];

export const BOTTOM_NAV: NavItem[] = [
  { label: 'Settings', link: '/settings', icon: 'hgi-settings-02' },
];
