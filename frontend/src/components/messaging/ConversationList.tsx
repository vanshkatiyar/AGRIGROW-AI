import React from 'react';
import { ConversationItem } from './ConversationItem';
import { Conversation } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ConversationListProps {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  onConversationSelect: (conversation: Conversation) => void;
  isLoading: boolean;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  selectedConversation,
  onConversationSelect,
  isLoading
}) => {
  if (isLoading) {
    return (
      <div className="flex-1 p-2 space-y-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="flex items-center space-x-3 p-2 sm:p-3">
            <Skeleton className="h-8 w-8 sm:h-10 sm:w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 sm:h-4 w-3/4" />
              <Skeleton className="h-2 sm:h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-sm sm:text-base text-muted-foreground">No conversations yet</p>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Start a new conversation to get started
          </p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1">
      <div className="space-y-0.5 sm:space-y-1 p-1 sm:p-2">
        {conversations.map((conversation) => (
          <ConversationItem
            key={conversation._id}
            conversation={conversation}
            isSelected={selectedConversation?._id === conversation._id}
            onClick={() => onConversationSelect(conversation)}
          />
        ))}
      </div>
    </ScrollArea>
  );
};