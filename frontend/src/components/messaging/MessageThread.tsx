import React, { useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { TypingIndicator } from './TypingIndicator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Conversation, Message, User } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useSocket } from '@/context/SocketContext';
import { getConversationMessages, markConversationAsRead } from '@/services/messageService';
import { Phone, Video, MoreVertical, ArrowLeft } from 'lucide-react';
import { OnlineStatus } from './OnlineStatus';
import { CallHistorySection } from './CallHistorySection';
import { useCall } from '@/context/CallContext';

interface MessageThreadProps {
  conversation: Conversation;
  onConversationUpdate: () => void;
  onBackToList?: () => void;
}

export const MessageThread: React.FC<MessageThreadProps> = ({
  conversation,
  onConversationUpdate,
  onBackToList
}) => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Call context for calling functionality
  const { startCall } = useCall();

  // Get the other participant
  const otherParticipant = conversation.participants.find(
    (participant) => participant._id !== user?.id
  ) as User;

  // Fetch messages for this conversation
  const { 
    data: messagesData, 
    isLoading: isLoadingMessages,
    refetch: refetchMessages 
  } = useQuery({
    queryKey: ['messages', conversation._id],
    queryFn: () => getConversationMessages(conversation._id),
    enabled: !!conversation._id
  });

  const messages = messagesData?.messages || [];

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mark conversation as read when opened
  useEffect(() => {
    if (conversation._id && (conversation.unreadCount || 0) > 0) {
      markConversationAsRead(conversation._id)
        .then(() => {
          onConversationUpdate();
        })
        .catch(console.error);
    }
  }, [conversation._id, conversation.unreadCount, onConversationUpdate]);

  // Socket event handlers for this conversation
  useEffect(() => {
    if (!socket || !conversation._id) return;

    const handleNewMessage = (message: Message) => {
      if (message.conversationId === conversation._id) {
        refetchMessages();
      }
    };

    const handleMessageRead = (data: { messageId: string }) => {
      refetchMessages();
    };

    const handleMessageDelivered = (data: { messageId: string }) => {
      refetchMessages();
    };

    socket.on('newMessage', handleNewMessage);
    socket.on('messageRead', handleMessageRead);
    socket.on('messageDelivered', handleMessageDelivered);

    return () => {
      socket.off('newMessage', handleNewMessage);
      socket.off('messageRead', handleMessageRead);
      socket.off('messageDelivered', handleMessageDelivered);
    };
  }, [socket, conversation._id, refetchMessages]);

  const handleSendMessage = (content: string) => {
    if (!socket || !otherParticipant) return;

    socket.emit('sendMessage', {
      recipientId: otherParticipant._id,
      content,
      conversationId: conversation._id
    });
  };

  // Handle call initiation
  const handleStartCall = async (callType: 'audio' | 'video') => {
    if (!otherParticipant) return;
    
    try {
      await startCall(otherParticipant._id, otherParticipant.name, callType);
    } catch (error) {
      console.error('Failed to start call:', error);
      // You could show a toast notification here
    }
  };

  if (!otherParticipant) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-muted-foreground">Invalid conversation</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
        {/* Header */}
      <div className="p-3 sm:p-4 border-b flex items-center justify-between bg-background">
        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
          {/* Back button for mobile */}
          {onBackToList && (
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden p-2"
              onClick={onBackToList}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          
          <div className="relative flex-shrink-0">
            <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
              <AvatarImage src={otherParticipant.profileImage} />
              <AvatarFallback>
                {otherParticipant.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <OnlineStatus userId={otherParticipant._id} />
          </div>
          
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-sm sm:text-base truncate">
              {otherParticipant.name}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground truncate">
              {otherParticipant.role && `${otherParticipant.role} • `}
              {otherParticipant.location}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => handleStartCall('audio')}
            title="Start audio call"
            className="p-2"
          >
            <Phone className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => handleStartCall('video')}
            title="Start video call"
            className="p-2"
          >
            <Video className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="p-2">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-2 sm:p-4">
        <div className="space-y-3 sm:space-y-4">
          {isLoadingMessages ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <p className="text-muted-foreground">No messages yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Send a message to start the conversation
                </p>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <MessageBubble
                key={message._id}
                message={message}
                isOwn={typeof message.senderId === 'string' 
                  ? message.senderId === user?.id 
                  : message.senderId._id === user?.id}
              />
            ))
          )}
          
          {/* Typing indicator */}
          <TypingIndicator 
            conversationId={conversation._id} 
            currentUserId={user?.id || ''} 
          />
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Call History Section */}
      <CallHistorySection 
        conversationId={conversation._id}
        className="border-t"
      />

      {/* Message Input */}
      <div className="border-t bg-background">
        <MessageInput
          onSendMessage={handleSendMessage}
          conversationId={conversation._id}
          disabled={isLoadingMessages}
        />
      </div>
    </div>
  );
};