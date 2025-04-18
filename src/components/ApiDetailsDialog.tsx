
import React from 'react';
import { Resource, Tool } from '@/types/api';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ApiDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'tool' | 'resource';
  item: Tool | Resource;
  server: string;
}

const ApiDetailsDialog = ({ isOpen, onClose, type, item, server }: ApiDetailsDialogProps) => {
  const serverName = server.split('/').slice(-2)[0];
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-full">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {item.name}
            <Badge variant="secondary" className="text-xs">
              {serverName}
            </Badge>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {item.description && (
            <p className="text-sm text-muted-foreground">{item.description}</p>
          )}
          
          {type === 'tool' && (item as Tool).inputSchema && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Input Parameters:</h4>
              <div className="bg-slate-50 p-4 rounded-md">
                <pre className="text-xs overflow-x-auto whitespace-pre-wrap break-all">
                  {JSON.stringify((item as Tool).inputSchema.properties, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ApiDetailsDialog;
