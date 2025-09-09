import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Phone, PhoneOff, Video, Mic } from 'lucide-react';

interface IncomingCallModalProps {
  callerName: string;
  callerAvatar?: string | null;
  callType: 'audio' | 'video';
  onAnswer: () => void;
  onReject: () => void;
}

export const IncomingCallModal: React.FC<IncomingCallModalProps> = ({
  callerName,
  callerAvatar,
  callType,
  onAnswer,
  onReject
}) => {
  return (
    <Dialog open={true}>
      <DialogContent className="max-w-[90vw] sm:max-w-md mx-auto">
        <div className="text-center py-4 sm:py-6">
          {/* Caller Avatar */}
          <div className="mb-4 sm:mb-6">
            <Avatar className="h-16 w-16 sm:h-24 sm:w-24 mx-auto">
              <AvatarImage src={callerAvatar || undefined} />
              <AvatarFallback className="text-lg sm:text-2xl">
                {callerName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Call Info */}
          <div className="mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-semibold mb-2">{callerName}</h2>
            <div className="flex items-center justify-center space-x-2 text-muted-foreground">
              {callType === 'video' ? (
                <Video className="h-4 w-4" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
              <span className="text-sm sm:text-base">Incoming {callType} call</span>
            </div>
          </div>

          {/* Ringing Animation */}
          <div className="mb-6 sm:mb-8">
            <div className="flex justify-center">
              <div className="animate-pulse">
                <div className="h-2 w-2 sm:h-3 sm:w-3 bg-green-500 rounded-full"></div>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-2">Ringing...</p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-6 sm:space-x-8">
            {/* Reject Button */}
            <Button
              variant="destructive"
              size="lg"
              className="h-12 w-12 sm:h-14 sm:w-14 rounded-full"
              onClick={onReject}
            >
              <PhoneOff className="h-5 w-5 sm:h-6 sm:w-6" />
            </Button>

            {/* Answer Button */}
            <Button
              variant="default"
              size="lg"
              className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-green-500 hover:bg-green-600"
              onClick={onAnswer}
            >
              <Phone className="h-5 w-5 sm:h-6 sm:w-6" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};