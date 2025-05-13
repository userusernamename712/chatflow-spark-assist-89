
import { ApiResponse } from '@/types/api';
import { useAuth } from '@/contexts/AuthContext';

const API_URL = import.meta.env.VITE_API_URL;

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

export const fetchApiMetadata = async (customer_id: string): Promise<ApiResponse> => {
  try {
    const queryParam = `?customer_id=${encodeURIComponent(customer_id)}`;
    const headers = getAuthHeaders();

    const [resourcesRes, templatesRes, toolsRes, serversRes] = await Promise.all([
      fetch(`${API_URL}/resources${queryParam}`, { headers }),
      fetch(`${API_URL}/resource-templates${queryParam}`, { headers }),
      fetch(`${API_URL}/tools${queryParam}`, { headers }),
      fetch(`${API_URL}/servers`, { headers }),
    ]);

    const [resources, resource_templates, tools, { servers }] = await Promise.all([
      resourcesRes.json(),
      templatesRes.json(),
      toolsRes.json(),
      serversRes.json(),
    ]);

    return {
      resources: resources.resources,
      resource_templates: resource_templates.resource_templates,
      tools: tools.tools,
      servers,
    };
  } catch (error) {
    console.error('Error fetching API metadata:', error);
    throw error;
  }
};
