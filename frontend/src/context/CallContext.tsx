import React, { createContext, useContext, ReactNode } from 'react';
import { useWebRTC } from '@/hooks/useWebRTC';
import { CallInterface } from '@/components/calling/CallInterface';

interface CallContextType {
  startCall: (recipientId: string, recipientName: string, callType: 'audio' | 'video') => Promise<void>;
  endCall: () => void;
  isInCall: boolean;
}

const CallContext = createContext<CallContextType | null>(null);

export const useCall = () => {
  const context = useContext(CallContext);
  if (!context) {
    throw new Error('useCall must be used within a CallProvider');
  }
  return context;
};

interface CallProviderProps {
  children: ReactNode;
}

export const CallProvider: React.FC<CallProviderProps> = ({ children }) => {
  const {
    callState,
    localVideoRef,
    remoteVideoRef,
    isMuted,
    isVideoEnabled,
    connectionMetrics,
    qualityMode,
    startCall,
    answerCall,
    rejectCall,
    endCall,
    toggleMute,
    toggleVideo,
    retryConnection,
    switchToAudioOnly,
    setVideoQuality
  } = useWebRTC();

  const contextValue: CallContextType = {
    startCall,
    endCall: () => {
      console.log('CallContext: endCall called');
      endCall();
    },
    isInCall: callState.isInCall
  };

  return (
    <CallContext.Provider value={contextValue}>
      {children}
      
      {/* Global Call Interface */}
      <CallInterface
        callState={callState}
        localVideoRef={localVideoRef}
        remoteVideoRef={remoteVideoRef}
        isMuted={isMuted}
        isVideoEnabled={isVideoEnabled}
        connectionMetrics={connectionMetrics}
        qualityMode={qualityMode}
        onAnswerCall={answerCall}
        onRejectCall={rejectCall}
        onEndCall={endCall}
        onToggleMute={toggleMute}
        onToggleVideo={toggleVideo}
        onRetryConnection={retryConnection}
        onSwitchToAudioOnly={switchToAudioOnly}
        onSetVideoQuality={setVideoQuality}
      />
    </CallContext.Provider>
  );
};