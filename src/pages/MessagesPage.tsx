import { Layout } from '@/components/layout/Layout';
import { ConversationList, Conversation } from '@/components/chat/ConversationList';
import { ChatWindow, Message } from '@/components/chat/ChatWindow';
import { useSocket } from '@/context/SocketContext';
import { useAuth } from '@/context/AuthContext';
import React, { useState, useEffect } from 'react';
import api from '@/api/axios'; // <-- IMPORT THE NEW API CLIENT

const MessagesPage = () => {
    const { socket } = useSocket();
    const { user } = useAuth();

    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true); // <-- ADD LOADING STATE
    const [error, setError] = useState<string | null>(null); // <-- ADD ERROR STATE

    // 1. Fetch all conversations on component mount
    useEffect(() => {
        const fetchConversations = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await api.get('/conversations');
                // --- THIS IS THE FIX ---
                // Ensure that the response data is an array before setting it
                if (Array.isArray(response.data)) {
                    setConversations(response.data);
                } else {
                    // If the data is not an array, it's an error from the backend
                    throw new Error('Failed to fetch conversations.');
                }
            } catch (err) {
                console.error("Failed to fetch conversations", err);
                setError('Could not load your conversations. Please try again later.');
            } finally {
                setLoading(false);
            }
        };
        fetchConversations();
    }, []);

    // 2. Listen for incoming messages via socket (no changes needed here)
    useEffect(() => {
        if (socket) {
            const handleNewMessage = (message: Message & { senderId: string }) => {
                if (message.senderId === selectedConversation?.id) {
                    setMessages((prevMessages) => [...prevMessages, message]);
                }
            };
            socket.on('newMessage', handleNewMessage);
            return () => {
                socket.off('newMessage', handleNewMessage);
            };
        }
    }, [socket, selectedConversation]);

    // 3. Handle selecting a conversation
    const handleSelectConversation = async (conversation: Conversation) => {
        setSelectedConversation(conversation);
        try {
            const response = await api.get(`/messages/${conversation.id}`);
            if (Array.isArray(response.data)) {
                setMessages(response.data);
            }
        } catch (error) {
            console.error("Failed to fetch messages", error);
            setMessages([]);
        }
    };

    // 4. Handle sending a new message (no changes needed here)
    const handleSendMessage = (content: string) => {
        if (!socket || !user || !selectedConversation) return;
        const messageData = {
            _id: Date.now().toString(),
            senderId: user.id,
            recipientId: selectedConversation.id,
            content,
        };
        socket.emit('sendMessage', messageData);
        setMessages((prevMessages) => [...prevMessages, messageData]);
    };

    if (loading) return <Layout><div className="text-center p-10">Loading conversations...</div></Layout>;
    if (error) return <Layout><div className="text-center p-10 text-red-500">{error}</div></Layout>;

    return (
        <Layout>
            <div className="container mx-auto p-0 h-[calc(100vh-4.1rem)]">
                <div className="border rounded-lg h-full flex">
                    <ConversationList
                        conversations={conversations}
                        selectedConversationId={selectedConversation?.id || null}
                        onSelectConversation={handleSelectConversation}
                    />
                    <ChatWindow
                        conversation={selectedConversation}
                        messages={messages}
                        onSendMessage={handleSendMessage}
                    />
                </div>
            </div>
        </Layout>
    );
};

export default MessagesPage;