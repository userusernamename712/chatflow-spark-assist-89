
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
  { id: "grupo-saona", name: "Grupo Saona" },
  { id: "sibuya", name: "Grupo Sibuya" },
  { id: "ona-hotels", name: "Hoteles Ona Hotels" },
  { id: "pierre-et-vacances", name: "Hoteles Pierre et Vacances" },
  { id: "med-playa", name: "Hoteles Med Playa" },
  { id: "don-cactus", name: "Campings Don Cactus" },
];

// Default customer ID
export const DEFAULT_CUSTOMER_ID = "grupo-grosso-napoletano";
