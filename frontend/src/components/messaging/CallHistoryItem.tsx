import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { 
  Phone, 
  Video, 
  PhoneIncoming, 
  PhoneOutgoing, 
  PhoneMissed,
  Clock,
  PhoneOff
} from 'lucide-react';
import { CallHistoryItem } from '@/services/callHistoryService';
import { useAuth } from '@/context/AuthContext';
import { useCall } from '@/context/CallContext';
import { cn } from '@/lib/utils';

interface CallHistoryItemProps {
  call: CallHistoryItem;
  className?: string;
}

export const CallHistoryItemComponent: React.FC<CallHistoryItemProps> = ({
  call,
  className
}) => {
  const { user } = useAuth();
  const { startCall } = useCall();

  const isOutgoing = call.participants.caller === user?.id;
  const otherUser = isOutgoing ? call.calleeInfo : call.callerInfo;

  const getCallIcon = () => {
    const baseIcon = call.type === 'video' ? Video : Phone;
    
    if (call.status === 'missed') {
      return <PhoneMissed className="h-4 w-4 text-red-500" />;
    }
    
    if (call.status === 'rejected') {
      return <PhoneOff className="h-4 w-4 text-red-500" />;
    }
    
    if (isOutgoing) {
      return <PhoneOutgoing className="h-4 w-4 text-green-500" />;
    } else {
      return <PhoneIncoming className="h-4 w-4 text-blue-500" />;
    }
  };

  const getCallStatusText = () => {
    switch (call.status) {
      case 'completed':
        return isOutgoing ? 'Outgoing call' : 'Incoming call';
      case 'missed':
        return isOutgoing ? 'Cancelled' : 'Missed call';
      case 'rejected':
        return isOutgoing ? 'Call declined' : 'Declined';
      case 'failed':
        return 'Call failed';
      default:
        return 'Call';
    }
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) {
      return `${seconds}s`;
    }
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatCallTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const handleCallBack = () => {
    if (otherUser) {
      startCall(otherUser._id, otherUser.name, call.type);
    }
  };

  return (
    <div className={cn(
      'flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors',
      className
    )}>
      {/* Call Icon */}
      <div className="flex-shrink-0">
        {getCallIcon()}
      </div>

      {/* User Avatar */}
      <div className="flex-shrink-0">
        <Avatar className="h-8 w-8">
          <AvatarImage src={otherUser.profileImage} />
          <AvatarFallback className="text-xs">
            {otherUser.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </div>

      {/* Call Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate">
              {otherUser.name}
            </p>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <span>{getCallStatusText()}</span>
              {call.duration && call.status === 'completed' && (
                <>
                  <span>•</span>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>{formatDuration(call.duration)}</span>
                  </div>
                </>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <span>{formatCallTime(call.startTime)}</span>
          </div>
        </div>
      </div>

      {/* Call Back Button */}
      <div className="flex-shrink-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCallBack}
          className="h-8 w-8 p-0"
          title={`Call back with ${call.type}`}
        >
          {call.type === 'video' ? (
            <Video className="h-4 w-4" />
          ) : (
            <Phone className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
};