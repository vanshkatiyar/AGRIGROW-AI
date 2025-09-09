import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Phone, 
  Video, 
  ChevronDown, 
  ChevronUp,
  History
} from 'lucide-react';
import { getConversationCallHistory } from '@/services/callHistoryService';
import { CallHistoryItemComponent } from './CallHistoryItem';
import { cn } from '@/lib/utils';

interface CallHistorySectionProps {
  conversationId: string;
  className?: string;
}

export const CallHistorySection: React.FC<CallHistorySectionProps> = ({
  conversationId,
  className
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [page, setPage] = useState(1);

  const {
    data: callHistoryData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['callHistory', conversationId, page],
    queryFn: () => getConversationCallHistory(conversationId, page, 10),
    enabled: !!conversationId
  });

  const calls = callHistoryData?.calls || [];
  const hasMore = callHistoryData?.hasMore || false;

  if (isLoading && calls.length === 0) {
    return (
      <div className={cn('space-y-2', className)}>
        <div className="flex items-center space-x-2 px-3 py-2">
          <History className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">Call History</span>
        </div>
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex items-center space-x-3 p-3">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="h-8 w-8 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn('p-3', className)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <History className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Call History</span>
          </div>
        </div>
        <div className="mt-2 text-center">
          <p className="text-sm text-red-500">Failed to load call history</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            className="mt-1"
          >
            Try again
          </Button>
        </div>
      </div>
    );
  }

  if (calls.length === 0) {
    return (
      <div className={cn('p-3', className)}>
        <div className="flex items-center space-x-2">
          <History className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">Call History</span>
        </div>
        <div className="mt-2 text-center py-4">
          <div className="flex justify-center space-x-2 mb-2">
            <Phone className="h-8 w-8 text-muted-foreground/50" />
            <Video className="h-8 w-8 text-muted-foreground/50" />
          </div>
          <p className="text-sm text-muted-foreground">No calls yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Start a voice or video call to see your history here
          </p>
        </div>
      </div>
    );
  }

  const displayedCalls = isExpanded ? calls : calls.slice(0, 3);

  return (
    <div className={cn('border-t bg-muted/20', className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2">
        <div className="flex items-center space-x-2">
          <History className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">
            Call History ({calls.length})
          </span>
        </div>
        
        {calls.length > 3 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-6 px-2"
          >
            {isExpanded ? (
              <>
                <span className="text-xs mr-1">Show less</span>
                <ChevronUp className="h-3 w-3" />
              </>
            ) : (
              <>
                <span className="text-xs mr-1">Show all</span>
                <ChevronDown className="h-3 w-3" />
              </>
            )}
          </Button>
        )}
      </div>

      {/* Call History List */}
      <ScrollArea className={cn(
        'transition-all duration-200',
        isExpanded ? 'max-h-80' : 'max-h-48'
      )}>
        <div className="space-y-1 pb-2">
          {displayedCalls.map((call) => (
            <CallHistoryItemComponent
              key={call._id}
              call={call}
              className="mx-2"
            />
          ))}
        </div>

        {/* Load More Button */}
        {isExpanded && hasMore && (
          <div className="px-3 pb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPage(prev => prev + 1)}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Loading...' : 'Load more calls'}
            </Button>
          </div>
        )}
      </ScrollArea>
    </div>
  );
};