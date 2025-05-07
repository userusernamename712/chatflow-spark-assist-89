import { ApiResponse } from '@/types/api';

const API_URL = import.meta.env.VITE_API_URL;
const API_KEY = import.meta.env.VITE_API_KEY;


export const fetchApiMetadata = async (customer_id: string): Promise<ApiResponse> => {
  try {
    const queryParam = `?customer_id=${encodeURIComponent(customer_id)}`;

    const headers = {
      'mcpikey': API_KEY,
    };

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
