
export interface Resource {
  uri?: string;
  name: string;
  description: string;
  mimeType: string | null;
  size: number | null;
  annotations: any | null;
}

export interface ResourceTemplate {
  uriTemplate: string;
  name: string;
  description: string;
  mimeType: string | null;
  annotations: any | null;
}

export interface Tool {
  name: string;
  description: string;
  inputSchema: {
    properties: Record<string, any>;
    required: string[];
    title: string;
    type: string;
  };
}

export interface ApiResponse {
  resources: Record<string, Record<string, Resource>>;
  resource_templates: Record<string, Record<string, ResourceTemplate>>;
  tools: Record<string, Record<string, Tool>>;
  servers: string[];
}
