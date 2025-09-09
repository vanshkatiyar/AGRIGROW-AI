import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { OnlineStatus } from './OnlineStatus';
import { Conversation, User } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface ConversationItemProps {
  conversation: Conversation;
  isSelected: boolean;
  onClick: () => void;
}

export const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  isSelected,
  onClick
}) => {
  const { user } = useAuth();

  // Get the other participant (not the current user)
  const otherParticipant = conversation.participants.find(
    (participant) => participant._id !== user?.id
  ) as User;

  if (!otherParticipant) {
    return null;
  }

  const lastMessageContent = conversation.lastMessage?.content || 'No messages yet';
  const lastMessageTime = conversation.lastActivity 
    ? formatDistanceToNow(new Date(conversation.lastActivity), { addSuffix: true })
    : '';

  const hasUnreadMessages = (conversation.unreadCount || 0) > 0;

  return (
    <div
      className={cn(
        'flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 rounded-lg cursor-pointer transition-colors hover:bg-muted/50 active:bg-muted/70',
        isSelected && 'bg-muted'
      )}
      onClick={onClick}
    >
      {/* Avatar with online status */}
      <div className="relative flex-shrink-0">
        <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
          <AvatarImage src={otherParticipant.profileImage} />
          <AvatarFallback>
            {otherParticipant.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <OnlineStatus userId={otherParticipant._id} />
      </div>

      {/* Conversation details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h4 className={cn(
            'text-xs sm:text-sm font-medium truncate',
            hasUnreadMessages && 'font-semibold'
          )}>
            {otherParticipant.name}
          </h4>
          {lastMessageTime && (
            <span className="text-xs text-muted-foreground flex-shrink-0 ml-1">
              {lastMessageTime}
            </span>
          )}
        </div>
        
        <div className="flex items-center justify-between mt-0.5 sm:mt-1">
          <p className={cn(
            'text-xs sm:text-sm text-muted-foreground truncate',
            hasUnreadMessages && 'text-foreground font-medium'
          )}>
            {lastMessageContent}
          </p>
          
          {hasUnreadMessages && (
            <Badge variant="default" className="ml-2 h-4 w-4 sm:h-5 sm:w-5 p-0 flex items-center justify-center text-xs flex-shrink-0">
              {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};