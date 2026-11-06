import { Permission, Role, StaffUser } from './user.modal';

// TODO: replace with data/users.service.ts
//   GET/POST/PUT/DELETE /api/users, POST /api/users/{id}/reset-password
export const CURRENT_USER_ID = 2; // TODO: from AuthService (header shows Somchai K. · Manager)

export const ROLES: { value: Role; label: string; badge: string }[] = [
  { value: 'manager', label: 'Manager', badge: 'bg-purple-50 text-purple-600' },
  { value: 'cashier', label: 'Cashier', badge: 'bg-blue-50 text-blue-600' },
  { value: 'waiter', label: 'Waiter', badge: 'bg-amber-50 text-amber-600' },
  { value: 'kitchen', label: 'Kitchen', badge: 'bg-orange-50 text-orange-600' },
  { value: 'admin', label: 'Admin', badge: 'bg-[#00c066]/10 text-[#00994f]' },
];

export const PERMISSIONS: { value: Permission; label: string }[] = [
  { value: 'pos', label: 'Take orders (POS)' },
  { value: 'kitchen', label: 'Kitchen display' },
  { value: 'discount', label: 'Apply discounts' },
  { value: 'void', label: 'Void / refund' },
  { value: 'menu', label: 'Manage menu' },
  { value: 'reports', label: 'View reports' },
];

const ALL: Permission[] = PERMISSIONS.map((p) => p.value);

/** filled in when a role is picked; the manager can still adjust them (except admin) */
export const ROLE_DEFAULTS: Record<Role, Permission[]> = {
  admin: ALL,
  manager: ALL,
  cashier: ['pos', 'discount'],
  waiter: ['pos'],
  kitchen: ['kitchen'],
};

export const USERS: StaffUser[] = [
  {
    id: 1,
    name: 'Admin User',
    email: 'admin@astronity.co',
    role: 'admin',
    permissions: ALL,
    active: true,
  },
  {
    id: 2,
    name: 'Somchai Kaew',
    email: 'somchai@astronity.co',
    role: 'manager',
    permissions: ALL,
    active: true,
  },
  {
    id: 3,
    name: 'Nok Phan',
    email: 'nok@astronity.co',
    role: 'cashier',
    permissions: ['pos', 'discount', 'reports'],
    active: true,
  },
  {
    id: 4,
    name: 'Aran Kit',
    email: 'aran@astronity.co',
    role: 'waiter',
    permissions: ['pos'],
    active: true,
  },
  {
    id: 5,
    name: 'Mali Thong',
    email: 'mali@astronity.co',
    role: 'cashier',
    permissions: ['pos', 'discount'],
    active: true,
  },
  {
    id: 6,
    name: 'Lek Chai',
    email: 'lek@astronity.co',
    role: 'kitchen',
    permissions: ['kitchen'],
    active: true,
  },
  {
    id: 7,
    name: 'Ploy Suk',
    email: 'ploy@astronity.co',
    role: 'waiter',
    permissions: ['pos'],
    active: false,
  },
];
