export interface FieldError {
  field: string;
  message: string;
}

export interface ApiErrorBody {
  code: string;
  message: string;
  details: FieldError[];
}

export interface Pagination {
  page: number; // starts at 0
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error: ApiErrorBody | null;
  meta: {
    timestamp: string;
    pagination?: Pagination
  };
}

export class ApiError extends Error {
  constructor(
    readonly status: number, // 0 = no connection
    readonly code: string, // e.g. INVALID_CREDENTIALS, NETWORK_ERROR
    message: string,
    readonly details: FieldError[] = [],
  ) {
    super(message);
  }
}


export const isUnauthorized = (e: unknown): e is ApiError =>
  e instanceof ApiError && e.status === 401;
