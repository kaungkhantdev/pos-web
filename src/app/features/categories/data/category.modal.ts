export interface Category {
  id: number;
  name: string;
  description: string;
  active: boolean;
  itemCount: number;
  createdAt: string; // ISO date from the API
}

/** Form value for create and edit */
export type CategoryInput = Pick<Category, 'name' | 'description' | 'active'>;
