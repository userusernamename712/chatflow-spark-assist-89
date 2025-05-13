
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

    // Use Promise.allSettled to ensure all requests complete, even if some fail
    const [resourcesRes, templatesRes, toolsRes, serversRes] = await Promise.allSettled([
      fetch(`${API_URL}/resources${queryParam}`, { headers }),
      fetch(`${API_URL}/resource-templates${queryParam}`, { headers }),
      fetch(`${API_URL}/tools${queryParam}`, { headers }),
      fetch(`${API_URL}/servers`, { headers }),
    ]);

    // Default empty values
    const defaultResponse = {
      resources: [],
      resource_templates: [],
      tools: {},
      servers: [],
    };

    // Helper to safely parse JSON from responses
    const safeJsonParse = async (response: PromiseFulfilledResult<Response>) => {
      if (!response.value.ok) {
        console.warn(`API returned ${response.value.status} status`);
        return null;
      }
      
      try {
        return await response.value.json();
      } catch (error) {
        console.error('Error parsing JSON response:', error);
        return null;
      }
    };

    // Parse responses safely
    const resources = resourcesRes.status === 'fulfilled' 
      ? await safeJsonParse(resourcesRes) 
      : null;
    
    const resource_templates = templatesRes.status === 'fulfilled' 
      ? await safeJsonParse(templatesRes) 
      : null;
    
    const tools = toolsRes.status === 'fulfilled' 
      ? await safeJsonParse(toolsRes) 
      : null;
    
    const servers = serversRes.status === 'fulfilled' 
      ? await safeJsonParse(serversRes) 
      : null;

    // Construct response with fallbacks for missing data
    return {
      resources: resources?.resources || defaultResponse.resources,
      resource_templates: resource_templates?.resource_templates || defaultResponse.resource_templates,
      tools: tools?.tools || defaultResponse.tools,
      servers: servers?.servers || defaultResponse.servers,
    };
  } catch (error) {
    console.error('Error fetching API metadata:', error);
    // Return default empty response instead of throwing
    return {
      resources: [],
      resource_templates: [],
      tools: {},
      servers: [],
    };
  }
};
