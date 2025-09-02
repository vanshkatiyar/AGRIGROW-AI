import React, { useState, useRef, useEffect } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Paperclip } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Conversation } from './ConversationList';
import { useAuth } from '@/context/AuthContext';

export interface Message {
  _id: string;
  senderId: string;
  content: string;
}

interface ChatWindowProps {
  conversation: Conversation | null;
  messages: Message[];
  onSendMessage: (content: string) => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ conversation, messages, onSendMessage }) => {
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState('');
  const lastMessageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    lastMessageRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!conversation) {
    return (
      <div className="w-2/3 flex items-center justify-center">
        <p className="text-muted-foreground">Select a conversation to start chatting</p>
      </div>
    );
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim());
      setNewMessage('');
    }
  };

  return (
    <div className="w-2/3 flex flex-col h-full">
      <div className="p-4 border-b flex items-center gap-3">
        <Avatar>
          <AvatarImage src={conversation.profileImage} />
          <AvatarFallback>{conversation.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold">{conversation.name}</p>
          <p className="text-xs text-green-500">Online</p>
        </div>
      </div>
      <div className="flex-1 p-6 space-y-4 overflow-y-auto bg-gray-50 dark:bg-gray-900">
        {messages.map((msg) => (
          <div
            key={msg._id}
            className={cn("flex items-end gap-2", msg.senderId === user?.id ? "justify-end" : "justify-start")}
          >
            {msg.senderId !== user?.id && (
              <Avatar className="h-8 w-8">
                <AvatarFallback>{conversation.name.charAt(0)}</AvatarFallback>
              </Avatar>
            )}
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
  );
};