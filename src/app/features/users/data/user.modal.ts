export type Role = 'admin' | 'manager' | 'cashier' | 'waiter' | 'kitchen';
export type Permission = 'pos' | 'kitchen' | 'discount' | 'void' | 'menu' | 'reports';

export interface StaffUser {
  id: number;
  name: string;
  email: string;
  role: Role;
  permissions: Permission[];
  active: boolean;
}
