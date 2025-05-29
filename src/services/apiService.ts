
import { ApiResponse } from '@/types/api';
import { useAuth } from '@/contexts/AuthContext';

const API_URL = import.meta.env.VITE_API_URL;

// Helper function to get auth headers
const getAuthHeaders = (): HeadersInit => {
  let headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
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
    // Extract actual customer_id if it contains cache-busting parameter
    const actualCustomerId = customer_id.includes('&_t=') 
      ? customer_id.split('&_t=')[0] 
      : customer_id;
    
    // Add cache-busting timestamp
    const timestamp = new Date().getTime();
    const queryParam = `?customer_id=${encodeURIComponent(actualCustomerId)}&_t=${timestamp}`;
    const headers = getAuthHeaders();

    console.log('Fetching API metadata for customer:', actualCustomerId);

    const [resourcesRes, templatesRes, toolsRes, serversRes] = await Promise.all([
      fetch(`${API_URL}/resources${queryParam}`, { headers }),
      fetch(`${API_URL}/resource-templates${queryParam}`, { headers }),
      fetch(`${API_URL}/tools${queryParam}`, { headers }),
      fetch(`${API_URL}/servers?_t=${timestamp}`, { headers }),
    ]);

    if (!resourcesRes.ok || !templatesRes.ok || !toolsRes.ok || !serversRes.ok) {
      throw new Error('One or more API requests failed');
    }

    const [resources, resource_templates, tools, { servers }] = await Promise.all([
      resourcesRes.json(),
      templatesRes.json(),
      toolsRes.json(),
      serversRes.json(),
    ]);

    console.log('API metadata fetched successfully. Tools available:', Object.keys(tools.tools || {}));

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
