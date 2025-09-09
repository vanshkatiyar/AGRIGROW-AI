import React, { useState, useEffect } from 'react';
import { useSocket } from '@/context/SocketContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface TypingIndicatorProps {
  conversationId: string;
  currentUserId: string;
}

interface TypingUser {
  userId: string;
  name?: string;
  profileImage?: string;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  conversationId,
  currentUserId
}) => {
  const { socket } = useSocket();
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);

  useEffect(() => {
    if (!socket) return;

    const handleUserTyping = (data: { 
      conversationId: string; 
      userId: string; 
      isTyping: boolean;
      name?: string;
      profileImage?: string;
    }) => {
      // Only handle typing for this conversation
      if (data.conversationId !== conversationId) return;
      
      // Don't show typing indicator for current user
      if (data.userId === currentUserId) return;

      setTypingUsers(prev => {
        if (data.isTyping) {
          // Add user to typing list if not already there
          const exists = prev.some(user => user.userId === data.userId);
          if (!exists) {
            return [...prev, {
              userId: data.userId,
              name: data.name,
              profileImage: data.profileImage
            }];
          }
          return prev;
        } else {
          // Remove user from typing list
          return prev.filter(user => user.userId !== data.userId);
        }
      });
    };

    socket.on('userTyping', handleUserTyping);

    return () => {
      socket.off('userTyping', handleUserTyping);
    };
  }, [socket, conversationId, currentUserId]);

  if (typingUsers.length === 0) {
    return null;
  }

  const getTypingText = () => {
    if (typingUsers.length === 1) {
      return `${typingUsers[0].name || 'Someone'} is typing...`;
    } else if (typingUsers.length === 2) {
      return `${typingUsers[0].name || 'Someone'} and ${typingUsers[1].name || 'someone else'} are typing...`;
    } else {
      return `${typingUsers.length} people are typing...`;
    }
  };

  return (
    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
      {/* Show avatar of first typing user */}
      {typingUsers[0] && (
        <Avatar className="h-6 w-6">
          <AvatarImage src={typingUsers[0].profileImage} />
          <AvatarFallback className="text-xs">
            {typingUsers[0].name?.charAt(0).toUpperCase() || '?'}
          </AvatarFallback>
        </Avatar>
      )}
      
      {/* Typing text */}
      <span>{getTypingText()}</span>
      
      {/* Animated dots */}
      <div className="flex space-x-1">
        <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" />
        <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
        <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
      </div>
    </div>
  );
};