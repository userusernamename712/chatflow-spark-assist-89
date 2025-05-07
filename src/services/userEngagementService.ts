
import { ApiResponse } from '@/types/api';

const API_URL = import.meta.env.VITE_API_URL;
const API_KEY = import.meta.env.VITE_API_KEY;

// Helper function to get auth headers
const getAuthHeaders = (): HeadersInit => {
  let headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  // Get the auth token from local storage
  const token = localStorage.getItem('chatAuthToken');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

export interface UserEngagement {
  conversation_count: number;
  mean_user_messages: number;
}

export interface UserEngagementResponse {
  [email: string]: UserEngagement;
}

export interface UserInfo {
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
}

// Complete list of users with their full names
export const allUsers: UserInfo[] = [
  { email: "adria@bookline.ai", firstName: "Adrià", lastName: "Úbeda", fullName: "Adrià Úbeda" },
  { email: "alex@bookline.ai", firstName: "Alex", lastName: "Lorenzo", fullName: "Alex Lorenzo" },
  { email: "almudena@bookline.ai", firstName: "Almudena", lastName: "Ucha", fullName: "Almudena Ucha" },
  { email: "antonio@bookline.ai", firstName: "Antonio", lastName: "Hidalgo", fullName: "Antonio Hidalgo" },
  { email: "ariadna.ros@bookline.ai", firstName: "Ariadna", lastName: "Ros", fullName: "Ariadna Ros" },
  { email: "bea@bookline.ai", firstName: "Beatriz", lastName: "Oliveira", fullName: "Beatriz Oliveira" },
  { email: "bernat@bookline.ai", firstName: "Bernat", lastName: "Clivillé", fullName: "Bernat Clivillé" },
  { email: "blanca@bookline.ai", firstName: "Blanca María", lastName: "Sánchez Jurado", fullName: "Blanca María Sánchez Jurado" },
  { email: "bruno@bookline.ai", firstName: "Bruno", lastName: "Jover", fullName: "Bruno Jover" },
  { email: "carlos@bookline.ai", firstName: "Carlos", lastName: "Zapater", fullName: "Carlos Zapater" },
  { email: "carlos.framis@bookline.ai", firstName: "Carlos", lastName: "Framis", fullName: "Carlos Framis" },
  { email: "carlos.sarrias@bookline.ai", firstName: "Carlos", lastName: "Sarrias", fullName: "Carlos Sarrias" },
  { email: "clara@bookline.ai", firstName: "Clara", lastName: "Dominguez", fullName: "Clara Dominguez" },
  { email: "clara.segura@bookline.ai", firstName: "Clara", lastName: "Segura", fullName: "Clara Segura" },
  { email: "dani@bookline.ai", firstName: "Dani", lastName: "Esteves", fullName: "Dani Esteves" },
  { email: "dani.romances@bookline.ai", firstName: "Dani", lastName: "Romances", fullName: "Dani Romances" },
  { email: "dani.milan@bookline.ai", firstName: "Dani", lastName: "Milán", fullName: "Dani Milán" },
  { email: "dani.toro@bookline.ai", firstName: "Dani", lastName: "Toro", fullName: "Dani Toro" },
  { email: "diana@bookline.ai", firstName: "Diana", lastName: "Rosca", fullName: "Diana Rosca" },
  { email: "ferran@bookline.ai", firstName: "Ferran", lastName: "Pelegrina", fullName: "Ferran Pelegrina" },
  { email: "florian@bookline.ai", firstName: "Florian Pascal", lastName: "Abel", fullName: "Florian Pascal Abel" },
  { email: "gabriela@bookline.ai", firstName: "Gabriela", lastName: "Codina", fullName: "Gabriela Codina" },
  { email: "gloria@bookline.ai", firstName: "Gloria", lastName: "Florido", fullName: "Gloria Florido" },
  { email: "gonzalo@bookline.ai", firstName: "Gonzalo", lastName: "Falcón", fullName: "Gonzalo Falcón" },
  { email: "ines@bookline.ai", firstName: "Inês", lastName: "Pires", fullName: "Inês Pires" },
  { email: "jaime@bookline.ai", firstName: "Jaime", lastName: "Amor", fullName: "Jaime Amor" },
  { email: "javi@bookline.ai", firstName: "Javi", lastName: "Gallostra", fullName: "Javi Gallostra" },
  { email: "javi.sanchez@bookline.ai", firstName: "Javi", lastName: "Sanchez", fullName: "Javi Sanchez" },
  { email: "joan@bookline.ai", firstName: "Joan", lastName: "Salvatella", fullName: "Joan Salvatella" },
  { email: "joan.sanz@bookline.ai", firstName: "Joan", lastName: "Sanz", fullName: "Joan Sanz" },
  { email: "joancami@bookline.ai", firstName: "Joan Ramón", lastName: "Camí", fullName: "Joan Ramón Camí" },
  { email: "jose@bookline.ai", firstName: "Jose", lastName: "Esponera", fullName: "Jose Esponera" },
  { email: "josemi@bookline.ai", firstName: "Josemi", lastName: "Fernandez", fullName: "Josemi Fernandez" },
  { email: "judit@bookline.ai", firstName: "Judit", lastName: "Rico", fullName: "Judit Rico" },
  { email: "laia@bookline.ai", firstName: "Laia", lastName: "Pons", fullName: "Laia Pons" },
  { email: "luis@bookline.ai", firstName: "Luis", lastName: "López Balcells", fullName: "Luis López Balcells" },
  { email: "lydia@bookline.ai", firstName: "Lydia", lastName: "Montero", fullName: "Lydia Montero" },
  { email: "marc.camps1@bookline.ai", firstName: "Marc", lastName: "Camps", fullName: "Marc Camps" },
  { email: "maria@bookline.ai", firstName: "Maria", lastName: "Suárez", fullName: "Maria Suárez" },
  { email: "mercedes@bookline.ai", firstName: "Mercedes", lastName: "Carbó", fullName: "Mercedes Carbó" },
  { email: "merce@bookline.ai", firstName: "Mercè", lastName: "Botanch", fullName: "Mercè Botanch" },
  { email: "meri@bookline.ai", firstName: "Meritxell", lastName: "Goikoetxea", fullName: "Meritxell Goikoetxea" },
  { email: "miguel@bookline.ai", firstName: "Miguel", lastName: "Ocáriz Linares", fullName: "Miguel Ocáriz Linares" },
  { email: "pablo.mayor@bookline.ai", firstName: "Pablo", lastName: "Mayor", fullName: "Pablo Mayor" },
  { email: "pablo@bookline.ai", firstName: "Pablo", lastName: "Sánchez", fullName: "Pablo Sánchez" },
  { email: "pablo.gil@bookline.ai", firstName: "Pablo", lastName: "Gil-Penna", fullName: "Pablo Gil-Penna" },
  { email: "paula@bookline.ai", firstName: "Paula", lastName: "Muñoz", fullName: "Paula Muñoz" },
  { email: "pedro@bookline.ai", firstName: "Pedro", lastName: "Ortega", fullName: "Pedro Ortega" },
  { email: "quique@bookline.ai", firstName: "Quique", lastName: "Roca", fullName: "Quique Roca" },
  { email: "sergi@bookline.ai", firstName: "Sergi", lastName: "Teruel", fullName: "Sergi Teruel" },
  { email: "tomas@bookline.ai", firstName: "Tomas", lastName: "Perez", fullName: "Tomas Perez" },
  { email: "victor@bookline.ai", firstName: "Victor", lastName: "Anfossi", fullName: "Victor Anfossi" }
];

// Get user info by email
export const getUserInfo = (email: string): UserInfo | undefined => {
  const [name, domain] = email.split("@");
  if (!name || !domain.startsWith("bookline")) return undefined;

  return allUsers.find(user => user.email.startsWith(`${name}@bookline`));
};

export const fetchUserEngagement = async (): Promise<UserEngagementResponse> => {
  try {
    const response = await fetch(`${API_URL}/conversations/count-by-user`, {
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch user engagement data: ${response.status}`);
    }

    const apiData = await response.json();

    const completeData: UserEngagementResponse = {};

    // Temp map to deduplicate by `name@bookline`
    const deduped: { [key: string]: { email: string; data: UserEngagement } } = {};

    // Populate deduped map from API data
    Object.entries(apiData).forEach(([email, data]) => {
      const [name, domain] = email.split("@");
      if (!name || !domain.startsWith("bookline")) return;

      const key = `${name}@bookline`;

      // If not already present, add it
      if (!deduped[key]) {
        deduped[key] = { email, data: data as UserEngagement };
      }
    });

    // Add all users with default 0 values
    allUsers.forEach(user => {
      const [name] = user.email.split("@");
      const key = `${name}@bookline`;

      if (deduped[key]) {
        completeData[user.email] = deduped[key].data;
      } else {
        completeData[user.email] = {
          conversation_count: 0,
          mean_user_messages: 0
        };
      }
    });

    return completeData;
  } catch (error) {
    console.error('Error fetching user engagement data:', error);
    throw error;
  }
};

// Helper function to extract user name from email
export const extractUserNameFromEmail = (email: string): string => {
  const userInfo = getUserInfo(email);
  return userInfo ? userInfo.firstName : email.split('@')[0];
};

// Get full name by email
export const getFullNameFromEmail = (email: string): string => {
  const userInfo = getUserInfo(email);
  return userInfo ? userInfo.fullName : email.split('@')[0];
};
