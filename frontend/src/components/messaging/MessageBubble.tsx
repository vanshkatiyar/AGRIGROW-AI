import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Message, User } from '@/types';
import { cn } from '@/lib/utils';
import { format, isToday, isYesterday } from 'date-fns';
import { Check, CheckCheck } from 'lucide-react';

interface MessageBubbleProps {
    message: Message;
    isOwn: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwn }) => {
    const sender = typeof message.senderId === 'string'
        ? null
        : message.senderId as User;

    const formatMessageTime = (dateString: string) => {
        const date = new Date(dateString);

        if (isToday(date)) {
            return format(date, 'HH:mm');
        } else if (isYesterday(date)) {
            return `Yesterday ${format(date, 'HH:mm')}`;
        } else {
            return format(date, 'MMM d, HH:mm');
        }
    };

    const getDeliveryStatus = () => {
        if (!isOwn) return null;

        if (message.isRead) {
            return <CheckCheck className="h-3 w-3 text-blue-500" />;
        } else if (message.isDelivered) {
            return <CheckCheck className="h-3 w-3 text-muted-foreground" />;
        } else {
            return <Check className="h-3 w-3 text-muted-foreground" />;
        }
    };

    return (
        <div className={cn(
            'flex items-end space-x-2 max-w-[85%] sm:max-w-[75%] lg:max-w-[70%]',
            isOwn ? 'ml-auto flex-row-reverse space-x-reverse' : 'mr-auto'
        )}>
            {/* Avatar for received messages */}
            {!isOwn && sender && (
                <Avatar className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0">
                    <AvatarImage src={sender.profileImage} />
                    <AvatarFallback className="text-xs">
                        {sender.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                </Avatar>
            )}

            {/* Message bubble */}
            <div className={cn(
                'rounded-lg px-2 py-1.5 sm:px-3 sm:py-2 max-w-full min-w-0',
                isOwn
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground'
            )}>
                {/* Message content */}
                <div className="break-words text-sm sm:text-base leading-relaxed">
                    {message.content}
                </div>

                {/* Message metadata */}
                <div className={cn(
                    'flex items-center justify-end space-x-1 mt-1 text-xs',
                    isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
                )}>
                    <span className="text-xs">{formatMessageTime(message.createdAt)}</span>
                    {getDeliveryStatus()}
                </div>

                {/* Edited indicator */}
                {message.editedAt && (
                    <div className={cn(
                        'text-xs mt-1',
                        isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
                    )}>
                        <Badge variant="secondary" className="text-xs px-1 py-0">
                            Edited
                        </Badge>
                    </div>
                )}
            </div>
        </div>
    );
};