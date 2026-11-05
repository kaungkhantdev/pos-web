// TODO: replace with data/pos.service.ts → GET /api/products, /api/orders, /api/tables
export interface MenuItem {
  id: number;
  name: string;
  note: string;
  price: number;
  category: string;
  image: string; // unsplash photo id
}

export interface CartLine {
  item: MenuItem;
  qty: number;
  modifiers: string[];
  instructions: string;
}

export interface ActiveOrder {
  id: string;
  table: string;
  customer: string;
  progress: number; // %
  items: number;
}

export const photo = (id: string, w: number, h: number) =>
  `https://images.unsplash.com/${id}?w=${w}&h=${h}&fit=crop&q=80`;

export const MENU: MenuItem[] = [
  {
    id: 1,
    name: 'Sashimi',
    note: 'With Chicken Egg',
    price: 180,
    category: 'Sushi',
    image: 'photo-1579871494447-9811cf80d66c',
  },
  {
    id: 2,
    name: 'Makizushi',
    note: 'Vegetarian',
    price: 140,
    category: 'Sushi',
    image: 'photo-1617196034796-73dfa7b1fd56',
  },
  {
    id: 3,
    name: 'Tamagoyaki',
    note: 'With Soy Sauce',
    price: 95,
    category: 'Main Course',
    image: 'photo-1553621042-f6e147245754',
  },
  {
    id: 4,
    name: 'Chicken Donburi',
    note: 'Japanese Rice Bowl',
    price: 190,
    category: 'Main Course',
    image: 'photo-1569050467447-ce54b3bbc37d',
  },
  {
    id: 5,
    name: 'Yakitori',
    note: 'With Spicy Sauce',
    price: 160,
    category: 'Main Course',
    image: 'photo-1529692236671-f1f6cf9683ba',
  },
  {
    id: 6,
    name: 'Noodles Ramen',
    note: 'With Sausages',
    price: 150,
    category: 'Soup',
    image: 'photo-1569718212165-3a8278d5f624',
  },
  {
    id: 7,
    name: 'Okonomiyaki',
    note: 'With Spicy Sauce',
    price: 210,
    category: 'Main Course',
    image: 'photo-1579027989536-b7b1f875659b',
  },
  {
    id: 8,
    name: 'Curry Rice',
    note: 'With Spicy Sauce',
    price: 200,
    category: 'Main Course',
    image: 'photo-1604908176997-125f25cc6f3d',
  },
];

const item = (id: number) => MENU.find((m) => m.id === id)!;

export const START_CART: CartLine[] = [
  { item: item(1), qty: 1, modifiers: [], instructions: '' },
  { item: item(7), qty: 1, modifiers: [], instructions: '' },
  { item: item(3), qty: 2, modifiers: [], instructions: '' },
  { item: item(6), qty: 1, modifiers: [], instructions: '' },
];

export const ACTIVE_ORDERS: ActiveOrder[] = [
  { id: 'ORD-1042', table: '12', customer: 'Rachmad Jailani', progress: 85, items: 6 },
  { id: 'ORD-1041', table: '9', customer: 'Steve Houdini', progress: 60, items: 9 },
  { id: 'ORD-1039', table: '1', customer: 'Maulana Ragnar', progress: 40, items: 12 },
];

export const FREE_TABLES = ['T2', 'T6', 'T8', 'T10', 'T13', 'T14', 'T15', 'Bar 1'];

export const MODIFIERS = [
  'No onions',
  'Extra cheese',
  'No cucumber',
  'Extra spicy',
  'Less spicy',
  'No peanuts',
  'On the side',
];
