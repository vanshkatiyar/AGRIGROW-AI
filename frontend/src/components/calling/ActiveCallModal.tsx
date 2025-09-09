import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CallState } from '@/hooks/useWebRTC';
import {
  PhoneOff,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Maximize2,
  Minimize2,
  AlertTriangle,
  RefreshCw,
  BarChart3
} from 'lucide-react';
import { ConnectionQualityIndicator, ConnectionMetrics } from './ConnectionQualityIndicator';
import { QualityControlPanel } from './QualityControlPanel';
import { cn } from '@/lib/utils';

interface ActiveCallModalProps {
  callState: CallState;
  localVideoRef: React.RefObject<HTMLVideoElement>;
  remoteVideoRef: React.RefObject<HTMLVideoElement>;
  isMuted: boolean;
  isVideoEnabled: boolean;
  connectionMetrics?: {
    packetLoss?: number;
    roundTripTime?: number;
    bandwidth?: number;
    jitter?: number;
  };
  qualityMode?: 'auto' | 'high' | 'medium' | 'low';
  onEndCall: () => void;
  onSetVideoQuality?: (quality: 'auto' | 'high' | 'medium' | 'low') => void;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onRetryConnection?: () => void;
  onSwitchToAudioOnly?: () => void;
}

export const ActiveCallModal: React.FC<ActiveCallModalProps> = ({
  callState,
  localVideoRef,
  remoteVideoRef,
  isMuted,
  isVideoEnabled,
  connectionMetrics,
  qualityMode = 'auto',
  onEndCall,
  onToggleMute,
  onToggleVideo,
  onRetryConnection,
  onSwitchToAudioOnly,
  onSetVideoQuality
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [showMetrics, setShowMetrics] = useState(false);

  // Call timer
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (callState.status === 'connected') {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [callState.status]);

  // Format call duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusText = () => {
    if (callState.connection.isReconnecting) {
      return 'Reconnecting...';
    }

    switch (callState.status) {
      case 'initiating':
        return 'Starting call...';
      case 'ringing':
        return callState.isOutgoing ? 'Calling...' : 'Ringing...';
      case 'connecting':
        return 'Connecting...';
      case 'connected':
        return formatDuration(callDuration);
      case 'ended':
        return 'Call ended';
      case 'error':
        return callState.connection.lastError || 'Call failed';
      default:
        return '';
    }
  };



  const isOpen = callState.isInCall &&
    callState.status !== 'idle' &&
    callState.status !== 'ended';

  console.log('ActiveCallModal render:', {
    isInCall: callState.isInCall,
    status: callState.status,
    isOpen
  });

  return (
    <Dialog open={isOpen}>
      <DialogContent
        className={cn(
          "w-full h-full sm:max-w-4xl sm:h-auto mx-auto p-0 overflow-hidden",
          "sm:w-[95vw] md:w-[90vw] lg:w-[80vw] xl:w-[70vw]",
          "sm:max-h-[90vh] sm:rounded-lg",
          isFullscreen && "max-w-full h-full w-full sm:rounded-none"
        )}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <div className="relative h-screen sm:h-[70vh] md:h-[80vh] lg:h-[600px] bg-gray-900 text-white">
          {/* Video Call Layout */}
          {callState.callType === 'video' ? (
            <>
              {/* Remote Video (Main) */}
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />

              {/* Local Video (Picture-in-Picture) */}
              <div className="absolute top-2 right-2 sm:top-4 sm:right-4 w-20 h-16 sm:w-32 sm:h-24 bg-gray-800 rounded-lg overflow-hidden border-2 border-white/20">
                {isVideoEnabled ? (
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-700">
                    <VideoOff className="h-4 w-4 sm:h-6 sm:w-6 text-gray-400" />
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Audio Call Layout */
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Avatar className="h-20 w-20 sm:h-32 sm:w-32 mx-auto mb-4 sm:mb-6">
                  <AvatarImage src={callState.remoteUserAvatar || undefined} />
                  <AvatarFallback className="text-2xl sm:text-4xl">
                    {callState.remoteUserName?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-lg sm:text-2xl font-semibold mb-2">
                  {callState.remoteUserName}
                </h2>
              </div>
            </div>
          )}

          {/* Call Info Overlay */}
          <div className="absolute top-2 left-2 sm:top-4 sm:left-4 bg-black/50 rounded-lg px-2 py-1 sm:px-3 sm:py-2 max-w-xs">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs sm:text-sm font-medium text-white">{callState.remoteUserName}</p>
              {callState.status === 'connected' && (
                <button
                  onClick={() => setShowMetrics(!showMetrics)}
                  className="text-white/70 hover:text-white transition-colors"
                  title="Show connection metrics"
                >
                  <BarChart3 className="h-3 w-3" />
                </button>
              )}
            </div>
            <p className="text-xs text-gray-300">{getStatusText()}</p>
            {callState.status === 'connected' && (
              <div className="mt-1">
                <ConnectionQualityIndicator
                  quality={callState.connection.quality}
                  isReconnecting={callState.connection.isReconnecting}
                  className="bg-white/10 text-white"
                />
              </div>
            )}
            {showMetrics && connectionMetrics && callState.status === 'connected' && (
              <div className="mt-2">
                <ConnectionMetrics
                  metrics={connectionMetrics}
                  className="bg-white/10 text-white"
                />
              </div>
            )}
          </div>

          {/* Error Message Overlay */}
          {callState.connection.lastError && callState.status !== 'error' && (
            <div className="absolute top-16 left-2 sm:top-20 sm:left-4 bg-red-600/80 rounded-lg px-2 py-1 sm:px-3 sm:py-2 max-w-xs">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-3 w-3 text-white" />
                <p className="text-xs text-white">{callState.connection.lastError}</p>
              </div>
            </div>
          )}

          {/* Fullscreen Toggle (Video only) - Hidden on mobile */}
          {callState.callType === 'video' && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-24 sm:top-4 sm:right-40 text-white hover:bg-white/20 hidden sm:flex"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
          )}

          {/* Call Controls */}
          <div className="absolute bottom-4 sm:bottom-6 left-1/2 transform -translate-x-1/2">
            <div className="flex items-center space-x-3 sm:space-x-4">
              {/* Mute Button */}
              <Button
                variant={isMuted ? "destructive" : "secondary"}
                size="lg"
                className={cn(
                  "h-12 w-12 rounded-full transition-all duration-200",
                  isMuted && "animate-pulse"
                )}
                onClick={onToggleMute}
                disabled={callState.status === 'error'}
                title={isMuted ? "Unmute microphone" : "Mute microphone"}
              >
                {isMuted ? (
                  <MicOff className="h-5 w-5" />
                ) : (
                  <Mic className="h-5 w-5" />
                )}
              </Button>

              {/* Video Toggle (Video calls only) */}
              {callState.callType === 'video' && (
                <Button
                  variant={!isVideoEnabled ? "destructive" : "secondary"}
                  size="lg"
                  className={cn(
                    "h-12 w-12 rounded-full transition-all duration-200",
                    !isVideoEnabled && "animate-pulse"
                  )}
                  onClick={onToggleVideo}
                  disabled={callState.status === 'error'}
                  title={isVideoEnabled ? "Turn off camera" : "Turn on camera"}
                >
                  {isVideoEnabled ? (
                    <Video className="h-5 w-5" />
                  ) : (
                    <VideoOff className="h-5 w-5" />
                  )}
                </Button>
              )}

              {/* Retry Connection Button (shown during errors or poor connection) */}
              {(callState.status === 'error' || callState.connection.quality === 'poor') && onRetryConnection && (
                <Button
                  variant="outline"
                  size="lg"
                  className="h-12 w-12 rounded-full bg-white/10 border-white/20 text-white hover:bg-white/20"
                  onClick={onRetryConnection}
                  disabled={callState.connection.isReconnecting}
                >
                  <RefreshCw className={cn("h-5 w-5", callState.connection.isReconnecting && "animate-spin")} />
                </Button>
              )}

              {/* Quality Control Panel */}
              {callState.callType === 'video' && callState.status === 'connected' && onSetVideoQuality && (
                <QualityControlPanel
                  currentQuality={qualityMode}
                  connectionQuality={callState.connection.quality}
                  onQualityChange={onSetVideoQuality}
                  onSwitchToAudioOnly={onSwitchToAudioOnly || (() => { })}
                  isVideoCall={true}
                />
              )}

              {/* End Call Button */}
              <Button
                variant="destructive"
                size="lg"
                className="h-12 w-12 rounded-full"
                onClick={() => {
                  console.log('End call button clicked');
                  onEndCall();
                }}
                title="End call"
              >
                <PhoneOff className="h-5 w-5" />
              </Button>
            </div>

            {/* Additional Controls for Poor Connection */}
            {callState.connection.quality === 'poor' && callState.callType === 'video' && onSwitchToAudioOnly && (
              <div className="mt-3 text-center">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 text-xs"
                  onClick={onSwitchToAudioOnly}
                >
                  Switch to Audio Only
                </Button>
              </div>
            )}
          </div>

          {/* Connection Status Overlay */}
          {(callState.status !== 'connected' || callState.connection.isReconnecting) && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
              <div className="text-center max-w-sm mx-auto px-4">
                {callState.status === 'error' ? (
                  <>
                    <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                    <p className="text-lg mb-2">Call Failed</p>
                    <p className="text-sm text-gray-300 mb-4">{callState.connection.lastError}</p>
                    {onRetryConnection && (
                      <Button
                        variant="outline"
                        onClick={onRetryConnection}
                        className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Retry Connection
                      </Button>
                    )}
                  </>
                ) : (
                  <>
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
                    <p className="text-lg">{getStatusText()}</p>
                    {callState.connection.isReconnecting && (
                      <p className="text-sm text-gray-300 mt-2">
                        Attempting to restore connection...
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};