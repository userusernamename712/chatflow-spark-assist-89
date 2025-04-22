import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Wrench, FileText, Server } from 'lucide-react';
import { AVAILABLE_CUSTOMERS } from '@/types/auth';
import { useQuery } from '@tanstack/react-query';
import { fetchApiMetadata } from '@/services/apiService';
import ApiDetailsDialog from './ApiDetailsDialog';
import { useAuth } from '@/contexts/AuthContext';
import { useCustomers } from '@/contexts/CustomerContext';

interface ProfileDialogProps {
  isOpen: boolean;
  onClose: () => void;
  customerId: string;
  onChangeCustomer: (customerId: string) => void;
}

const ProfileDialog = ({ isOpen, onClose, customerId, onChangeCustomer }: ProfileDialogProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDetails, setSelectedDetails] = useState<{
    type: 'tool' | 'resource';
    item: any;
    server: string;
  } | null>(null);
  const { startNewSession } = useAuth();
  const { customers, loading: customersLoading } = useCustomers();

  const { data: apiMetadata } = useQuery({
    queryKey: ['api-metadata', customerId],
    queryFn: () => fetchApiMetadata(customerId),
    enabled: !!customerId,
  });

  const filteredCustomers = searchQuery 
    ? customers.filter(customer =>
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  const handleCustomerSelect = (selectedCustomerId: string) => {
    if (selectedCustomerId !== customerId) {
      startNewSession(selectedCustomerId);
      onChangeCustomer(selectedCustomerId);
      setSearchQuery('');
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl w-[90vw] max-h-[85vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Profile & Settings</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Select Customer</label>
              <Input
                type="text"
                placeholder="Search customers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mb-2"
              />
              {searchQuery && (
                <div className="max-h-48 overflow-auto rounded-md border bg-background">
                  {filteredCustomers.map((customer) => (
                    <button
                      key={customer.id}
                      onClick={() => handleCustomerSelect(customer.id)}
                      className={`w-full px-4 py-2 text-left text-sm hover:bg-slate-50 transition-colors
                        ${customer.id === customerId ? 'bg-slate-50 text-primary' : ''}`}
                    >
                      {customer.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-2 block">API Capabilities</label>
              <Tabs defaultValue="tools" className="w-full">
                <TabsList className="w-full grid grid-cols-3 h-9">
                  <TabsTrigger value="tools">
                    <Wrench className="h-3 w-3 mr-1" />
                    Tools
                  </TabsTrigger>
                  <TabsTrigger value="resources">
                    <FileText className="h-3 w-3 mr-1" />
                    Resources
                  </TabsTrigger>
                  <TabsTrigger value="servers">
                    <Server className="h-3 w-3 mr-1" />
                    Servers
                  </TabsTrigger>
                </TabsList>

                <ScrollArea className="h-[50vh] mt-2 rounded-md border">
                  <TabsContent value="tools" className="p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {apiMetadata?.tools && Object.entries(apiMetadata.tools).map(([server, tools]) => (
                        Object.entries(tools).map(([name, tool]) => (
                          <div
                            key={`${server}-${name}`}
                            onClick={() => setSelectedDetails({ type: 'tool', item: tool, server })}
                            className="group p-3 border rounded-lg hover:border-primary/50 hover:bg-slate-50 cursor-pointer transition-colors"
                          >
                            <div className="flex items-center justify-between mb-1 flex-wrap gap-1">
                              <span className="font-medium text-sm">{tool.name}</span>
                              <Badge variant="secondary" className="text-xs">
                                {server.split('/').slice(-2)[0]}
                              </Badge>
                            </div>
                          </div>
                        ))
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="resources" className="p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {apiMetadata?.resources && Object.entries(apiMetadata.resources).map(([server, resources]) => (
                        Object.entries(resources).map(([uri, resource]) => (
                          <div
                            key={`${server}-${uri}`}
                            onClick={() => setSelectedDetails({ type: 'resource', item: resource, server })}
                            className="group p-3 border rounded-lg hover:border-primary/50 hover:bg-slate-50 cursor-pointer transition-colors"
                          >
                            <div className="flex items-center justify-between mb-1 flex-wrap gap-1">
                              <span className="font-medium text-sm">{resource.name}</span>
                              <Badge variant="secondary" className="text-xs">
                                {server.split('/').slice(-2)[0]}
                              </Badge>
                            </div>
                          </div>
                        ))
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="servers" className="p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {apiMetadata?.servers && apiMetadata.servers.map((server) => (
                        <div
                          key={server}
                          className="p-3 border rounded-lg text-sm text-muted-foreground"
                        >
                          {server.split('/').slice(-2)[0]}
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </ScrollArea>
              </Tabs>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {selectedDetails && (
        <ApiDetailsDialog
          isOpen={!!selectedDetails}
          onClose={() => setSelectedDetails(null)}
          type={selectedDetails.type}
          item={selectedDetails.item}
          server={selectedDetails.server}
        />
      )}
    </>
  );
};

export default ProfileDialog;
