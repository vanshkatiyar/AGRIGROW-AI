import React from 'react';
import { CallState } from '@/hooks/useWebRTC';
import { IncomingCallModal } from './IncomingCallModal';
import { ActiveCallModal } from './ActiveCallModal';

interface CallInterfaceProps {
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
  onAnswerCall: () => void;
  onRejectCall: () => void;
  onEndCall: () => void;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onRetryConnection?: () => void;
  onSwitchToAudioOnly?: () => void;
  onSetVideoQuality?: (quality: 'auto' | 'high' | 'medium' | 'low') => void;
}

export const CallInterface: React.FC<CallInterfaceProps> = ({
  callState,
  localVideoRef,
  remoteVideoRef,
  isMuted,
  isVideoEnabled,
  connectionMetrics,
  qualityMode,
  onAnswerCall,
  onRejectCall,
  onEndCall,
  onToggleMute,
  onToggleVideo,
  onRetryConnection,
  onSwitchToAudioOnly,
  onSetVideoQuality
}) => {
  // Show incoming call modal
  if (callState.isIncoming && callState.status === 'ringing') {
    return (
      <IncomingCallModal
        callerName={callState.remoteUserName || 'Unknown'}
        callerAvatar={callState.remoteUserAvatar}
        callType={callState.callType || 'audio'}
        onAnswer={onAnswerCall}
        onReject={onRejectCall}
      />
    );
  }

  // Show active call modal
  if (callState.isInCall && callState.status !== 'idle') {
    return (
      <ActiveCallModal
        callState={callState}
        localVideoRef={localVideoRef}
        remoteVideoRef={remoteVideoRef}
        isMuted={isMuted}
        isVideoEnabled={isVideoEnabled}
        connectionMetrics={connectionMetrics}
        qualityMode={qualityMode}
        onEndCall={onEndCall}
        onToggleMute={onToggleMute}
        onToggleVideo={onToggleVideo}
        onRetryConnection={onRetryConnection}
        onSwitchToAudioOnly={onSwitchToAudioOnly}
        onSetVideoQuality={onSetVideoQuality}
      />
    );
  }

  return null;
};