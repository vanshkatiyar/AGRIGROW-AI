import { Layout } from '@/components/layout/Layout';
import { ConversationList } from '@/components/chat/ConversationList';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { useSocketChat } from '@/hooks/useSocketChat';
import { useQuery } from '@tanstack/react-query';
import { getConversations, getMessages } from '@/services/messageService';
import { useState, useEffect } from 'react';
import { Conversation, Message } from '@/types';

const MessagesPage = () => {
  const { socket } = useSocketChat();
  const [selectedConversation, setSelectedConversation] = useState<any | null>(null);

  const { data: conversationData, isLoading: isLoadingConvos, refetch: refetchConversations } = useQuery({
    queryKey: ['conversations'],
    queryFn: getConversations,
  });

  const { data: messages = [], refetch: refetchMessages } = useQuery({
    queryKey: ['messages', selectedConversation?._id],
    queryFn: () => getMessages(selectedConversation!._id, selectedConversation!.name ? 'group' : undefined),
    enabled: !!selectedConversation,
  });
  
  useEffect(() => {
    if (!socket) return;
    
    const handleNewMessage = (newMessage: Message) => {
        const convoId = newMessage.groupId || newMessage.conversationId;
        if (convoId === selectedConversation?._id) {
            refetchMessages();
        }
        refetchConversations();
    };

    socket.on('newMessage', handleNewMessage);
    return () => { socket.off('newMessage', handleNewMessage); };
  }, [socket, selectedConversation, refetchMessages, refetchConversations]);

  return (
    <Layout>
        <div className="container mx-auto p-0 h-[calc(100vh-4.1rem)]">
            <div className="border rounded-lg h-full flex">
                <ConversationList
                    conversations={conversationData?.conversations || []}
                    groups={conversationData?.groups || []}
                    onSelectConversation={setSelectedConversation}
                    selectedConversationId={selectedConversation?._id || null}
                    isLoading={isLoadingConvos}
                />
                <ChatWindow
                    key={selectedConversation?._id}
                    conversation={selectedConversation}
                    messages={messages}
                />
            </div>
        </div>
    </Layout>
  );
};

export default MessagesPage;