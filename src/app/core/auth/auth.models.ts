export interface LoginRequest {
  username: string;
  password: string;
}

/** POST /auth/login and /auth/refresh */
export interface TokenPair {
  token: string;
  refreshToken: string;
}

/** GET /users/me (UserResponse in pos-api) */
export interface Me {
  id: number;
  email: string;
  name: string;
  username: string;
  status: 'active' | 'disabled';
}
