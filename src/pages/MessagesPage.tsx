import { Layout } from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Send, Paperclip } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSocket } from '@/context/SocketContext'; // Import the socket hook
import { useAuth } from '@/context/AuthContext'; // Import the auth hook
import React, { useState, useEffect, useRef } from 'react';

// A mock recipient for demonstration purposes
const mockRecipient = {
    id: 'recipient_user_002', // A placeholder ID
    name: 'Suresh Patel',
    image: '/api/placeholder/40/40',
};

interface Message {
    _id: string;
    senderId: string;
    recipientId: string;
    content: string;
    createdAt: string;
}

const MessagesPage = () => {
    const { socket } = useSocket();
    const { user } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const lastMessageRef = useRef<HTMLDivElement>(null);

    // Effect to scroll to the bottom when new messages arrive
    useEffect(() => {
        lastMessageRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Effect to listen for incoming messages
    useEffect(() => {
        if (socket) {
            const handleNewMessage = (message: Message) => {
                setMessages((prevMessages) => [...prevMessages, message]);
            };

            socket.on('newMessage', handleNewMessage);

            // Cleanup listener on component unmount
            return () => {
                socket.off('newMessage', handleNewMessage);
            };
        }
    }, [socket]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim() && socket && user) {
            const messageData = {
                senderId: user.id,
                recipientId: mockRecipient.id,
                content: newMessage.trim(),
            };
            socket.emit('sendMessage', messageData);
            setNewMessage('');
        }
    };

    return (
        <Layout>
            <div className="container mx-auto p-0 h-[calc(100vh-4.1rem)]">
                <div className="border rounded-lg h-full flex">
                    <div className="w-1/3 border-r flex flex-col">
                        <div className="p-4 border-b">
                            <h2 className="text-xl font-bold">Chats</h2>
                            <div className="relative mt-2"><Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" /><Input placeholder="Search messages..." className="pl-8" /></div>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                           <div className={cn("p-4 flex items-start gap-3 border-b cursor-pointer bg-muted")}>
                               <Avatar className="h-10 w-10"><AvatarImage src={mockRecipient.image} /><AvatarFallback>{mockRecipient.name.charAt(0)}</AvatarFallback></Avatar>
                               <div className="flex-1 overflow-hidden"><p className="font-semibold truncate">{mockRecipient.name}</p><p className="text-xs text-muted-foreground truncate">Click to chat...</p></div>
                           </div>
                        </div>
                    </div>

                    <div className="w-2/3 flex flex-col">
                        <div className="p-4 border-b flex items-center gap-3">
                            <Avatar><AvatarImage src={mockRecipient.image} /><AvatarFallback>{mockRecipient.name.charAt(0)}</AvatarFallback></Avatar>
                            <div><p className="font-semibold">{mockRecipient.name}</p><p className="text-xs text-green-500">Online</p></div>
                        </div>
                        <div className="flex-1 p-6 space-y-4 overflow-y-auto bg-gray-50 dark:bg-gray-900">
                           {messages.map((msg) => (
                               <div key={msg._id} className={cn("flex items-end gap-2", msg.senderId === user?.id ? "justify-end" : "justify-start")}>
                                   {msg.senderId !== user?.id && <Avatar className="h-8 w-8"><AvatarFallback>{mockRecipient.name.charAt(0)}</AvatarFallback></Avatar>}
                                   <div className={cn("max-w-xs md:max-w-md p-3 rounded-lg", msg.senderId === user?.id ? 'bg-primary text-primary-foreground' : 'bg-card border')}>
                                       <p className="text-sm">{msg.content}</p>
                                   </div>
                               </div>
                           ))}
                           <div ref={lastMessageRef} />
                        </div>
                        <div className="p-4 border-t bg-card">
                           <form onSubmit={handleSendMessage} className="relative">
                               <Input placeholder="Type a message..." className="pr-24" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} />
                               <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center">
                                   <Button type="button" variant="ghost" size="icon"><Paperclip className="h-5 w-5" /></Button>
                                   <Button type="submit"><Send className="h-4 w-4" /></Button>
                               </div>
                           </form>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default MessagesPage;