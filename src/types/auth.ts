
export interface User {
  id: string;
  username: string;
  createdAt: Date;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

// The customer ID is a fixed value representing the client organization
export const CUSTOMER_ID = "grupo-grosso-napoletano";
