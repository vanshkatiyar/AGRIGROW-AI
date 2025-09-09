import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useSocket } from '@/context/SocketContext';
import { Send, Paperclip, Smile } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  conversationId: string;
  disabled?: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  conversationId,
  disabled = false
}) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const { socket } = useSocket();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  // Handle typing indicators
  useEffect(() => {
    if (!socket || !conversationId) return;

    if (message.trim() && !isTyping) {
      setIsTyping(true);
      socket.emit('typing', { conversationId });
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        socket.emit('stopTyping', { conversationId });
      }
    }, 1000);

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [message, socket, conversationId, isTyping]);

  // Stop typing when component unmounts
  useEffect(() => {
    return () => {
      if (socket && conversationId && isTyping) {
        socket.emit('stopTyping', { conversationId });
      }
    };
  }, [socket, conversationId, isTyping]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedMessage = message.trim();
    if (!trimmedMessage || disabled) return;

    // Send message
    onSendMessage(trimmedMessage);
    
    // Clear input
    setMessage('');
    
    // Stop typing indicator
    if (socket && isTyping) {
      setIsTyping(false);
      socket.emit('stopTyping', { conversationId });
    }

    // Focus back to textarea
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  };

  const canSend = message.trim().length > 0 && !disabled;

  return (
    <form onSubmit={handleSubmit} className="p-2 sm:p-4">
      <div className="flex items-end space-x-2">
        {/* Attachment button - hidden on very small screens */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="mb-2 hidden xs:flex p-2"
          disabled={disabled}
        >
          <Paperclip className="h-4 w-4" />
        </Button>

        {/* Message input */}
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="min-h-[36px] sm:min-h-[40px] max-h-[100px] sm:max-h-[120px] resize-none pr-10 sm:pr-12 text-sm sm:text-base"
            disabled={disabled}
          />
          
          {/* Emoji button */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-1 sm:right-2 bottom-1 sm:bottom-2 p-1 sm:p-2"
            disabled={disabled}
          >
            <Smile className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        </div>

        {/* Send button */}
        <Button
          type="submit"
          size="sm"
          className={cn(
            'mb-2 transition-all p-2 sm:p-3',
            canSend ? 'bg-primary hover:bg-primary/90' : 'bg-muted'
          )}
          disabled={!canSend}
        >
          <Send className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
      </div>

      {/* Character count (optional) */}
      {message.length > 800 && (
        <div className="text-xs text-muted-foreground mt-1 text-right">
          {message.length}/1000
        </div>
      )}
    </form>
  );
};