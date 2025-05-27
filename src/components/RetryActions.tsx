
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, RotateCcw } from 'lucide-react';

type RetryActionsProps = {
  onRetry: () => void;
  onRefresh: () => void;
  disabled?: boolean;
};

const RetryActions = ({ onRetry, onRefresh, disabled }: RetryActionsProps) => {
  return (
    <div className="flex items-center gap-2 mt-2 ml-12">
      <Button
        variant="outline"
        size="sm"
        onClick={onRetry}
        disabled={disabled}
        className="text-xs border-[#E5DEFF] hover:bg-[#F1F0FB] text-[#9b87f5] hover:text-[#7E69AB]"
      >
        <RotateCcw className="h-3 w-3 mr-1" />
        Retry
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onRefresh}
        disabled={disabled}
        className="text-xs border-[#E5DEFF] hover:bg-[#F1F0FB] text-[#9b87f5] hover:text-[#7E69AB]"
      >
        <RefreshCw className="h-3 w-3 mr-1" />
        Refresh
      </Button>
    </div>
  );
};

export default RetryActions;
