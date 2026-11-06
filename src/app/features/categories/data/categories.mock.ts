import { Category } from './category.modal';

// TODO: replace with data/categories.service.ts → GET/POST/PUT/DELETE /api/categories
export const CATEGORIES: Category[] = [
  {
    id: 1,
    name: 'Main Course',
    description: 'Rice bowls, noodles & mains',
    active: true,
    itemCount: 42,
    createdAt: '2026-01-12',
  },
  {
    id: 2,
    name: 'Sushi',
    description: 'Rolls, sashimi & nigiri',
    active: true,
    itemCount: 18,
    createdAt: '2026-01-08',
  },
  {
    id: 3,
    name: 'Drinks',
    description: 'Soft drinks, tea & coffee',
    active: true,
    itemCount: 12,
    createdAt: '2026-01-05',
  },
  {
    id: 4,
    name: 'Dessert',
    description: 'Sweets, cakes & ice cream',
    active: false,
    itemCount: 9,
    createdAt: '2026-01-02',
  },
  {
    id: 5,
    name: 'Salad',
    description: 'Fresh & healthy bowls',
    active: true,
    itemCount: 6,
    createdAt: '2025-12-28',
  },
];
