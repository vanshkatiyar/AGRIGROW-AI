import { Layout } from '@/components/layout/Layout';
import { ConversationList } from '@/components/chat/ConversationList';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { useSocket } from '@/context/SocketContext';
import { useQuery } from '@tanstack/react-query';
import { getConversations, getMessages } from '@/services/messageService';
import { useState, useEffect } from 'react';
import { Conversation, Message } from '@/types'; // You might need to create this types file

const MessagesPage = () => {
  const { socket } = useSocket();
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);

  // Fetch all conversations
  const { data: conversations, isLoading: isLoadingConvos, refetch: refetchConversations } = useQuery<any>({
    queryKey: ['conversations'],
    queryFn: getConversations,
  });

  // Fetch messages for the selected conversation
  const { data: messages = [], refetch: refetchMessages } = useQuery<Message[]>({
    queryKey: ['messages', selectedConversation?._id],
    queryFn: () => getMessages(selectedConversation!._id),
    enabled: !!selectedConversation,
  });
  
  // Real-time message listener
  useEffect(() => {
    if (!socket) return;
    
    const handleNewMessage = (newMessage: Message) => {
      // If the message belongs to the currently selected conversation, refetch messages
      if (newMessage.conversationId === selectedConversation?._id) {
          refetchMessages();
      }
      // Always refetch the conversation list to update the last message
      refetchConversations();
    };

    socket.on('newMessage', handleNewMessage);

    return () => {
      socket.off('newMessage', handleNewMessage);
    };
  }, [socket, selectedConversation, refetchMessages, refetchConversations]);


  return (
    <Layout>
        <div className="container mx-auto p-0 h-[calc(100vh-4.1rem)]">
            <div className="border rounded-lg h-full flex">
                <ConversationList
                    conversations={conversations?.conversations || []}
                    groups={conversations?.groups || []}
                    onSelectConversation={setSelectedConversation}
                    selectedConversationId={selectedConversation?._id || null}
                    isLoading={isLoadingConvos}
                />
                <ChatWindow
                    key={selectedConversation?._id} // Re-mount component when conversation changes
                    conversation={selectedConversation}
                    messages={messages}
                />
            </div>
        </div>
    </Layout>
  );
};

export default MessagesPage;