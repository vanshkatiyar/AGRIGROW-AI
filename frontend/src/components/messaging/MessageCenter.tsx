import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ConversationList } from './ConversationList';
import { MessageThread } from './MessageThread';
import { UserSearch } from './UserSearch';
import { useSocket } from '@/context/SocketContext';
import { useAuth } from '@/context/AuthContext';
import { getConversations } from '@/services/messageService';
import { Conversation, Message } from '@/types';
import { Button } from '@/components/ui/button';
import { Plus, Search } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export const MessageCenter: React.FC = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const queryClient = useQueryClient();
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [showUserSearch, setShowUserSearch] = useState(false);

  // Fetch conversations
  const { 
    data: conversationsData, 
    isLoading: isLoadingConversations,
    refetch: refetchConversations 
  } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => getConversations(),
    enabled: !!user
  });

  // Socket event handlers
  useEffect(() => {
    if (!socket || !user) return;

    const handleNewMessage = (message: Message) => {
      // Update conversations list
      refetchConversations();
      
      // If the message is for the currently selected conversation, update messages
      if (selectedConversation && message.conversationId === selectedConversation._id) {
        queryClient.invalidateQueries({ 
          queryKey: ['messages', selectedConversation._id] 
        });
      }
    };

    const handleMessageDelivered = (data: { messageId: string }) => {
      // Update message delivery status
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    };

    const handleMessageRead = (data: { messageId: string; readBy: string }) => {
      // Update message read status
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    };

    const handleUserStatusChanged = (data: { userId: string; isOnline: boolean }) => {
      // Update user online status in conversations
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    };

    // Register socket event listeners
    socket.on('newMessage', handleNewMessage);
    socket.on('messageDelivered', handleMessageDelivered);
    socket.on('messageRead', handleMessageRead);
    socket.on('userStatusChanged', handleUserStatusChanged);

    return () => {
      socket.off('newMessage', handleNewMessage);
      socket.off('messageDelivered', handleMessageDelivered);
      socket.off('messageRead', handleMessageRead);
      socket.off('userStatusChanged', handleUserStatusChanged);
    };
  }, [socket, user, selectedConversation, queryClient, refetchConversations]);

  const handleConversationSelect = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    
    // Join conversation room for real-time updates
    if (socket) {
      socket.emit('joinConversation', conversation._id);
    }
  };

  const handleConversationCreated = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setShowUserSearch(false);
    refetchConversations();
  };

  return (
    <div className="h-full flex flex-col lg:flex-row bg-background">
      {/* Conversations Sidebar */}
      <div className={`
        ${selectedConversation ? 'hidden lg:flex' : 'flex'} 
        w-full lg:w-1/3 xl:w-1/4 
        border-r border-b lg:border-b-0 
        flex-col
        min-h-0
      `}>
        {/* Header */}
        <div className="p-3 sm:p-4 border-b flex items-center justify-between bg-background">
          <h2 className="text-lg sm:text-xl font-semibold">Messages</h2>
          <div className="flex gap-2">
            <Dialog open={showUserSearch} onOpenChange={setShowUserSearch}>
              <DialogTrigger asChild>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => {
                    console.log('🔍 Opening user search dialog');
                    setShowUserSearch(true);
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Start New Conversation</DialogTitle>
                </DialogHeader>
                <UserSearch onConversationCreated={handleConversationCreated} />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Conversations List */}
        <ConversationList
          conversations={conversationsData?.conversations || []}
          selectedConversation={selectedConversation}
          onConversationSelect={handleConversationSelect}
          isLoading={isLoadingConversations}
        />
      </div>

      {/* Message Thread */}
      <div className={`
        ${selectedConversation ? 'flex' : 'hidden lg:flex'} 
        flex-1 
        min-h-0
      `}>
        {selectedConversation ? (
          <MessageThread
            conversation={selectedConversation}
            onConversationUpdate={refetchConversations}
            onBackToList={() => setSelectedConversation(null)}
          />
        ) : (
          <div className="h-full flex items-center justify-center p-4">
            <div className="text-center max-w-sm">
              <div className="mb-4">
                <Search className="h-8 w-8 sm:h-12 sm:w-12 mx-auto text-muted-foreground" />
              </div>
              <h3 className="text-base sm:text-lg font-medium mb-2">No conversation selected</h3>
              <p className="text-sm sm:text-base text-muted-foreground mb-4">
                Choose a conversation from the sidebar or start a new one
              </p>
              <Button 
                onClick={() => setShowUserSearch(true)}
                className="w-full sm:w-auto"
              >
                <Plus className="h-4 w-4 mr-2" />
                Start New Conversation
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};