export interface User {
  id: string;
  email: string;
  name: string;
  roles: string[];
  permissions?: string[];
  avatar?: string;
  lastLogin?: string;
}

export interface AuthToken {
  access_token: string;
  expires_in: number;
  token_type: 'Bearer';
  scope?: string;
}

export interface UserContext {
  user: User | null;
  isAuthenticated: boolean;
  logout: () => void;
}