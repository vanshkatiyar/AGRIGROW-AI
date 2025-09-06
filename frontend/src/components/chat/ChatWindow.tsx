import React, { useState, useRef, useEffect } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useSocketChat } from '@/hooks/useSocketChat';
import { Message } from '@/types';

interface ChatWindowProps {
  conversation: any | null;
  messages: Message[];
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ conversation, messages }) => {
  const { user } = useAuth();
  const { socket } = useSocketChat();
  const [newMessage, setNewMessage] = useState('');
  const lastMessageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    lastMessageRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!conversation) {
    return <div className="w-2/3 flex items-center justify-center"><p className="text-muted-foreground">Select a conversation to start chatting</p></div>;
  }
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket || !user) return;

    if (conversation.name) { // It's a group
        socket.emit('sendGroupMessage', { groupId: conversation._id, content: newMessage.trim() });
    } else { // It's a 1-on-1 chat
        const recipientId = conversation.participants.find((p: any) => p._id !== user.id)?._id;
        if (recipientId) {
             socket.emit('sendMessage', { recipientId, content: newMessage.trim() });
        }
    }
    setNewMessage('');
  };

  const otherParticipant = conversation.participants?.find((p: any) => p._id !== user?.id);
  const chatName = conversation.name || otherParticipant?.name;
  const chatImage = otherParticipant?.profileImage;

  return (
    <div className="w-2/3 flex flex-col h-full">
      <div className="p-4 border-b flex items-center gap-3">
        <Avatar><AvatarImage src={chatImage} /><AvatarFallback>{chatName?.charAt(0)}</AvatarFallback></Avatar>
        <div><p className="font-semibold">{chatName}</p></div>
      </div>
      <div className="flex-1 p-6 space-y-4 overflow-y-auto bg-gray-50 dark:bg-gray-900">
        {messages.map((msg) => (
          <div key={msg._id} className={cn("flex items-end gap-2", msg.senderId._id === user?.id ? "justify-end" : "justify-start")}>
            {msg.senderId._id !== user?.id && <Avatar className="h-8 w-8"><AvatarImage src={msg.senderId.profileImage} /><AvatarFallback>{msg.senderId.name.charAt(0)}</AvatarFallback></Avatar>}
            <div className={cn("max-w-xs md:max-w-md p-3 rounded-lg", msg.senderId._id === user?.id ? 'bg-primary text-primary-foreground' : 'bg-card border')}><p className="text-sm">{msg.content}</p></div>
          </div>
        ))}
        <div ref={lastMessageRef} />
      </div>
      <div className="p-4 border-t bg-card">
        <form onSubmit={handleSendMessage} className="relative">
          <Input placeholder="Type a message..." className="pr-12" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} />
          <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center"><Button type="submit" size="icon" variant="ghost"><Send className="h-5 w-5" /></Button></div>
        </form>
      </div>
    </div>
  );
};