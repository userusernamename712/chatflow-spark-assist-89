
export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: Date;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  selectedCustomerId: string;
}

// Available customers that can be selected at login
export const AVAILABLE_CUSTOMERS = [
  { id: "grupo-grosso-napoletano", name: "Grupo Grosso Napoletano" },
  { id: "ristorante-italiano", name: "Ristorante Italiano" },
  { id: "pizzeria-bella-napoli", name: "Pizzeria Bella Napoli" },
];

// Default customer ID
export const DEFAULT_CUSTOMER_ID = "grupo-grosso-napoletano";
