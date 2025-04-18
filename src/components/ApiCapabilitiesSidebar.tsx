import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Wrench, FileText, Server } from 'lucide-react';
import { fetchApiMetadata } from '@/services/apiService';

const ApiCapabilitiesSidebar = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['api-metadata'],
    queryFn: fetchApiMetadata
  });

  if (isLoading) {
    return (
      <div className="w-72 p-4 border-l border-[#E5DEFF] bg-white">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-[#F1F0FB] rounded w-3/4"></div>
          <div className="h-32 bg-[#F1F0FB] rounded"></div>
          <div className="h-32 bg-[#F1F0FB] rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-72 p-4 border-l border-[#E5DEFF] bg-white">
        <Card className="bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">Failed to load API capabilities</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-72 border-l border-[#E5DEFF] bg-white">
      <div className="p-4">
        <h2 className="text-lg font-semibold text-[#1A1F2C] mb-4">API Capabilities</h2>
        <Tabs defaultValue="tools" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="tools" className="flex-1">
              <Wrench className="h-4 w-4 mr-2" />
              Tools
            </TabsTrigger>
            <TabsTrigger value="resources" className="flex-1">
              <FileText className="h-4 w-4 mr-2" />
              Resources
            </TabsTrigger>
            <TabsTrigger value="servers" className="flex-1">
              <Server className="h-4 w-4 mr-2" />
              Servers
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[calc(100vh-280px)]">
            <TabsContent value="tools" className="mt-4 space-y-4">
              {data?.tools && Object.entries(data.tools).map(([server, tools]) => (
                <Card key={server} className="bg-white border-[#E5DEFF]">
                  <CardHeader className="p-4">
                    <CardTitle className="text-sm font-medium text-[#7E69AB]">
                      {server.split('/').slice(-2)[0]}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    {Object.entries(tools).map(([name, tool]) => (
                      <div key={name} className="mb-3 last:mb-0">
                        <h4 className="text-sm font-medium text-[#1A1F2C] mb-1">{tool.name}</h4>
                        <p className="text-xs text-[#8E9196] whitespace-pre-wrap">{tool.description}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="resources" className="mt-4 space-y-4">
              {data?.resources && Object.entries(data.resources).map(([server, resources]) => (
                <Card key={server} className="bg-white border-[#E5DEFF]">
                  <CardHeader className="p-4">
                    <CardTitle className="text-sm font-medium text-[#7E69AB]">
                      {server.split('/').slice(-2)[0]}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    {Object.entries(resources).map(([uri, resource]) => (
                      <div key={uri} className="mb-3 last:mb-0">
                        <h4 className="text-sm font-medium text-[#1A1F2C] mb-1">{resource.name}</h4>
                        <p className="text-xs text-[#8E9196]">{resource.description}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="servers" className="mt-4 space-y-4">
              {data?.servers && data.servers.map((server) => (
                <Card key={server} className="bg-white border-[#E5DEFF]">
                  <CardHeader className="p-4">
                    <CardTitle className="text-sm font-medium text-[#7E69AB]">
                      {server.split('/').slice(-2)[0]}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-xs text-[#8E9196]">{server}</p>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </div>
    </div>
  );
};

export default ApiCapabilitiesSidebar;
