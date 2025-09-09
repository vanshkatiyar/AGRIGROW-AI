import React, { useState, useEffect } from 'react';
import { useSocket } from '@/context/SocketContext';
import { cn } from '@/lib/utils';

interface OnlineStatusProps {
  userId: string;
  className?: string;
  showText?: boolean;
}

export const OnlineStatus: React.FC<OnlineStatusProps> = ({ 
  userId, 
  className,
  showText = false 
}) => {
  const { socket } = useSocket();
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    if (!socket) return;

    // Listen for user status changes
    const handleUserStatusChanged = (data: { userId: string; isOnline: boolean }) => {
      if (data.userId === userId) {
        setIsOnline(data.isOnline);
      }
    };

    socket.on('userStatusChanged', handleUserStatusChanged);

    return () => {
      socket.off('userStatusChanged', handleUserStatusChanged);
    };
  }, [socket, userId]);

  if (showText) {
    return (
      <span className={cn(
        'text-xs',
        isOnline ? 'text-green-500' : 'text-muted-foreground',
        className
      )}>
        {isOnline ? 'Online' : 'Offline'}
      </span>
    );
  }

  return (
    <div className={cn(
      'absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background',
      isOnline ? 'bg-green-500' : 'bg-gray-400',
      className
    )} />
  );
};