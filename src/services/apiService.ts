
import { ApiResponse } from '@/types/api';

const API_URL = import.meta.env.VITE_API_URL;

export const fetchApiMetadata = async (): Promise<ApiResponse> => {
  try {
    const [resourcesRes, templatesRes, toolsRes, serversRes] = await Promise.all([
      fetch(`${API_URL}/resources`),
      fetch(`${API_URL}/resource-templates`),
      fetch(`${API_URL}/tools`),
      fetch(`${API_URL}/servers`),
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
