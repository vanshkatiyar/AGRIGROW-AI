import { useState, useRef, useCallback, useEffect } from 'react';
import { useSocket } from '@/context/SocketContext';
import { CallErrorHandler, createUserFriendlyError, handleErrorWithRetry, type CallError } from '@/utils/callErrorHandler';

export interface CallState {
  callId: string | null;
  isInCall: boolean;
  isIncoming: boolean;
  isOutgoing: boolean;
  callType: 'audio' | 'video' | null;
  remoteUserId: string | null;
  remoteUserName: string | null;
  remoteUserAvatar: string | null;
  status: 'idle' | 'initiating' | 'ringing' | 'connecting' | 'connected' | 'ended' | 'error';
  connection: {
    quality: 'excellent' | 'good' | 'poor' | 'unknown';
    isReconnecting: boolean;
    lastError: string | null;
    errorDetails: CallError | null;
  };
}

export const useWebRTC = () => {
  const { socket } = useSocket();
  const [callState, setCallState] = useState<CallState>({
    callId: null,
    isInCall: false,
    isIncoming: false,
    isOutgoing: false,
    callType: null,
    remoteUserId: null,
    remoteUserName: null,
    remoteUserAvatar: null,
    status: 'idle',
    connection: {
      quality: 'unknown',
      isReconnecting: false,
      lastError: null,
      errorDetails: null
    }
  });

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [qualityMode, setQualityMode] = useState<'auto' | 'high' | 'medium' | 'low'>('auto');
  const [currentVideoQuality, setCurrentVideoQuality] = useState<'high' | 'medium' | 'low'>('high');
  const [connectionQuality, setConnectionQuality] = useState<'excellent' | 'good' | 'poor' | 'unknown'>('unknown');
  const [connectionMetrics, setConnectionMetrics] = useState<{
    packetLoss?: number;
    roundTripTime?: number;
    bandwidth?: number;
    jitter?: number;
    bytesReceived?: number;
    bytesSent?: number;
  }>({});
  const [isConnecting, setIsConnecting] = useState(false);

  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const iceCandidateQueue = useRef<RTCIceCandidate[]>([]);
  const isProcessingCandidates = useRef(false);
  const connectionMonitorInterval = useRef<NodeJS.Timeout | null>(null);
  const callTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const deviceChangeListenerRef = useRef<(() => void) | null>(null);

  // Enhanced WebRTC configuration with fallback servers
  const [currentServerSet, setCurrentServerSet] = useState(0);
  
  const serverSets = [
    // Primary server set - Google STUN + OpenRelay TURN
    [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      {
        urls: 'turn:openrelay.metered.ca:80',
        username: 'openrelayproject',
        credential: 'openrelayproject'
      },
      {
        urls: 'turn:openrelay.metered.ca:443',
        username: 'openrelayproject',
        credential: 'openrelayproject'
      }
    ],
    // Fallback server set - Alternative STUN servers
    [
      { urls: 'stun:stun.stunprotocol.org:3478' },
      { urls: 'stun:stun.voiparound.com' },
      { urls: 'stun:stun.voipbuster.com' },
      {
        urls: 'turn:openrelay.metered.ca:443?transport=tcp',
        username: 'openrelayproject',
        credential: 'openrelayproject'
      }
    ],
    // Last resort - Minimal configuration
    [
      { urls: 'stun:stun.l.google.com:19302' }
    ]
  ];

  const getRtcConfig = useCallback(() => ({
    iceServers: serverSets[currentServerSet] || serverSets[0],
    iceCandidatePoolSize: 10,
    bundlePolicy: 'max-bundle' as RTCBundlePolicy,
    rtcpMuxPolicy: 'require' as RTCRtcpMuxPolicy
  }), [currentServerSet]);

  // Process ICE candidate queue
  const processIceCandidateQueue = useCallback(async () => {
    if (isProcessingCandidates.current || !peerConnection.current || iceCandidateQueue.current.length === 0) {
      return;
    }

    isProcessingCandidates.current = true;
    
    try {
      while (iceCandidateQueue.current.length > 0) {
        const candidate = iceCandidateQueue.current.shift();
        if (candidate && peerConnection.current.remoteDescription) {
          await peerConnection.current.addIceCandidate(candidate);
          console.log('Added ICE candidate from queue');
        }
      }
    } catch (error) {
      console.error('Error processing ICE candidate queue:', error);
      setCallState(prev => ({
        ...prev,
        connection: { ...prev.connection, lastError: 'ICE candidate processing failed' }
      }));
    } finally {
      isProcessingCandidates.current = false;
    }
  }, []);

  // Initialize peer connection
  const initializePeerConnection = useCallback(() => {
    try {
      // Clean up existing connection
      if (peerConnection.current) {
        peerConnection.current.close();
      }

      // Clear ICE candidate queue
      iceCandidateQueue.current = [];
      isProcessingCandidates.current = false;

      const pc = new RTCPeerConnection(getRtcConfig());
      peerConnection.current = pc;

      console.log('Initializing new peer connection');

      // Handle remote stream
      pc.ontrack = (event) => {
        console.log('Received remote stream:', event.streams[0]);
        setRemoteStream(event.streams[0]);
      };

      // Handle ICE candidates with proper error handling
      pc.onicecandidate = (event) => {
        if (event.candidate && socket && callState.callId) {
          console.log('Sending ICE candidate');
          socket.emit('iceCandidate', {
            callId: callState.callId,
            candidate: event.candidate
          });
        } else if (!event.candidate) {
          console.log('ICE gathering complete');
        }
      };

      // Handle ICE connection state changes
      pc.oniceconnectionstatechange = () => {
        console.log('ICE connection state:', pc.iceConnectionState);
        
        switch (pc.iceConnectionState) {
          case 'connected':
          case 'completed':
            setCallState(prev => ({
              ...prev,
              status: 'connected',
              connection: { ...prev.connection, isReconnecting: false, lastError: null, errorDetails: null }
            }));
            setIsConnecting(false);
            startConnectionQualityMonitoring(pc);
            break;
          case 'disconnected':
            setCallState(prev => ({
              ...prev,
              connection: { ...prev.connection, isReconnecting: true }
            }));
            // Don't end call immediately, allow for reconnection
            break;
          case 'failed':
            console.error('ICE connection failed');
            setCallState(prev => ({
              ...prev,
              connection: { ...prev.connection, lastError: 'Connection failed', isReconnecting: true }
            }));
            
            // Set error state after a delay
            setTimeout(() => {
              setCallState(prev => ({
                ...prev,
                status: 'error',
                connection: { ...prev.connection, isReconnecting: false }
              }));
            }, 3000);
            break;
          case 'closed':
            console.log('ICE connection closed');
            break;
        }
      };

      // Handle connection state changes
      pc.onconnectionstatechange = () => {
        console.log('Peer connection state:', pc.connectionState);
        
        switch (pc.connectionState) {
          case 'connecting':
            setIsConnecting(true);
            setCallState(prev => ({ ...prev, status: 'connecting' }));
            break;
          case 'connected':
            setCallState(prev => ({
              ...prev,
              status: 'connected',
              connection: { ...prev.connection, isReconnecting: false, lastError: null, errorDetails: null }
            }));
            setIsConnecting(false);
            break;
          case 'disconnected':
            setCallState(prev => ({
              ...prev,
              connection: { ...prev.connection, isReconnecting: true }
            }));
            break;
          case 'failed':
            console.error('Peer connection failed');
            setCallState(prev => ({
              ...prev,
              connection: { ...prev.connection, lastError: 'Peer connection failed', isReconnecting: true }
            }));
            
            // Set error state after a delay
            setTimeout(() => {
              setCallState(prev => ({
                ...prev,
                status: 'error',
                connection: { ...prev.connection, isReconnecting: false }
              }));
            }, 3000);
            break;
          case 'closed':
            console.log('Peer connection closed');
            break;
        }
      };

      // Handle signaling state changes
      pc.onsignalingstatechange = () => {
        console.log('Signaling state:', pc.signalingState);
        
        if (pc.signalingState === 'stable' && iceCandidateQueue.current.length > 0) {
          // Process queued ICE candidates when signaling is stable
          processIceCandidateQueue();
        }
      };

      return pc;
    } catch (error) {
      console.error('Error initializing peer connection:', error);
      setCallState(prev => ({
        ...prev,
        status: 'error',
        connection: { ...prev.connection, lastError: 'Failed to initialize connection' }
      }));
      throw error;
    }
  }, [socket, processIceCandidateQueue, getRtcConfig]);

  // Adapt video quality based on connection
  const adaptVideoQuality = useCallback(async (targetQuality: 'high' | 'medium' | 'low', force: boolean = false) => {
    if (!localStream || !peerConnection.current) {
      return;
    }

    // Don't auto-adapt if user has set manual quality mode
    if (!force && qualityMode !== 'auto') {
      return;
    }

    try {
      const videoTrack = localStream.getVideoTracks()[0];
      if (!videoTrack) {
        return;
      }

      const sender = peerConnection.current.getSenders().find(s => s.track === videoTrack);
      if (!sender) {
        return;
      }

      // Get current encoding parameters
      const params = sender.getParameters();
      if (!params.encodings || params.encodings.length === 0) {
        return;
      }

      // Adjust encoding parameters based on quality
      const encoding = params.encodings[0];
      switch (targetQuality) {
        case 'high':
          encoding.maxBitrate = 2500000; // 2.5 Mbps
          encoding.maxFramerate = 30;
          encoding.scaleResolutionDownBy = 1;
          break;
        case 'medium':
          encoding.maxBitrate = 1000000; // 1 Mbps
          encoding.maxFramerate = 24;
          encoding.scaleResolutionDownBy = 1.5;
          break;
        case 'low':
          encoding.maxBitrate = 500000; // 500 kbps
          encoding.maxFramerate = 15;
          encoding.scaleResolutionDownBy = 2;
          break;
      }

      await sender.setParameters(params);
      setCurrentVideoQuality(targetQuality);
      console.log(`Adapted video quality to ${targetQuality}`);

    } catch (error) {
      console.error('Error adapting video quality:', error);
      const callError = createUserFriendlyError(error as Error, 'Adapting video quality');
      setCallState(prev => ({
        ...prev,
        connection: { ...prev.connection, lastError: callError.userMessage, errorDetails: callError }
      }));
    }
  }, [localStream, qualityMode]);

  // Monitor connection quality
  const startConnectionQualityMonitoring = useCallback((pc: RTCPeerConnection) => {
    // Clear existing interval
    if (connectionMonitorInterval.current) {
      clearInterval(connectionMonitorInterval.current);
    }

    connectionMonitorInterval.current = setInterval(async () => {
      try {
        if (!pc || pc.connectionState === 'closed') {
          return;
        }

        const stats = await pc.getStats();
        let inboundStats = {
          bytesReceived: 0,
          packetsLost: 0,
          packetsReceived: 0,
          jitter: 0
        };
        let outboundStats = {
          bytesSent: 0,
          packetsSent: 0
        };
        let candidatePairStats = {
          roundTripTime: 0,
          availableOutgoingBitrate: 0
        };

        stats.forEach((report) => {
          if (report.type === 'inbound-rtp') {
            inboundStats.bytesReceived += report.bytesReceived || 0;
            inboundStats.packetsLost += report.packetsLost || 0;
            inboundStats.packetsReceived += report.packetsReceived || 0;
            inboundStats.jitter += report.jitter || 0;
          } else if (report.type === 'outbound-rtp') {
            outboundStats.bytesSent += report.bytesSent || 0;
            outboundStats.packetsSent += report.packetsSent || 0;
          } else if (report.type === 'candidate-pair' && report.state === 'succeeded') {
            candidatePairStats.roundTripTime = report.currentRoundTripTime || 0;
            candidatePairStats.availableOutgoingBitrate = report.availableOutgoingBitrate || 0;
          }
        });

        // Calculate metrics
        const packetLossRate = inboundStats.packetsReceived > 0 ? 
          inboundStats.packetsLost / inboundStats.packetsReceived : 0;
        
        const metrics = {
          packetLoss: packetLossRate,
          roundTripTime: candidatePairStats.roundTripTime,
          bandwidth: candidatePairStats.availableOutgoingBitrate,
          jitter: inboundStats.jitter,
          bytesReceived: inboundStats.bytesReceived,
          bytesSent: outboundStats.bytesSent
        };

        setConnectionMetrics(metrics);

        // Calculate quality based on multiple factors
        let quality: 'excellent' | 'good' | 'poor' | 'unknown' = 'unknown';
        
        if (inboundStats.packetsReceived > 0) {
          const rtt = candidatePairStats.roundTripTime;
          const jitter = inboundStats.jitter;
          
          if (packetLossRate < 0.01 && rtt < 0.1 && jitter < 0.03) {
            quality = 'excellent';
          } else if (packetLossRate < 0.03 && rtt < 0.2 && jitter < 0.05) {
            quality = 'good';
          } else {
            quality = 'poor';
          }
        }

        setConnectionQuality(quality);
        setCallState(prev => ({
          ...prev,
          connection: { ...prev.connection, quality }
        }));

        // Adaptive quality control and connection recovery
        if (qualityMode === 'auto' && localStream && callState.callType === 'video') {
          let targetQuality: 'high' | 'medium' | 'low' | null = null;
          
          if (quality === 'poor' && currentVideoQuality !== 'low') {
            targetQuality = 'low';
            console.log('Poor connection detected, reducing quality to low');
          } else if (quality === 'good' && currentVideoQuality === 'low') {
            targetQuality = 'medium';
            console.log('Connection improved, increasing quality to medium');
          } else if (quality === 'excellent' && currentVideoQuality !== 'high') {
            targetQuality = 'high';
            console.log('Excellent connection detected, increasing quality to high');
          }
          
          if (targetQuality) {
            // Use a timeout to avoid blocking the monitoring loop
            setTimeout(() => {
              adaptVideoQuality(targetQuality!);
              
              // If quality is still poor after adaptation, suggest audio-only
              if (targetQuality === 'low') {
                setTimeout(() => {
                  if (callState.connection.quality === 'poor') {
                    setCallState(prev => ({
                      ...prev,
                      connection: { 
                        ...prev.connection, 
                        lastError: 'Poor video quality detected. Consider switching to audio-only.' 
                      }
                    }));
                  }
                }, 5000);
              }
            }, 0);
          }
        }

        // Monitor for connection issues
        if (inboundStats.packetsReceived > 100 && packetLossRate > 0.1) {
          console.warn('High packet loss detected, connection may be unstable');
          setCallState(prev => ({
            ...prev,
            connection: { 
              ...prev.connection, 
              lastError: 'Connection unstable - high packet loss detected' 
            }
          }));
        }

      } catch (error) {
        console.error('Error monitoring connection quality:', error);
      }
    }, 5000); // Check every 5 seconds
  }, [adaptVideoQuality, callState.callType, callState.connection.quality, qualityMode, currentVideoQuality]);

  // Clean up connection monitoring
  const stopConnectionQualityMonitoring = useCallback(() => {
    if (connectionMonitorInterval.current) {
      clearInterval(connectionMonitorInterval.current);
      connectionMonitorInterval.current = null;
    }
  }, []);

  // Clear call timeout
  const clearCallTimeout = useCallback(() => {
    if (callTimeoutRef.current) {
      clearTimeout(callTimeoutRef.current);
      callTimeoutRef.current = null;
    }
  }, []);

  // Handle device changes during calls
  const handleDeviceChange = useCallback(async () => {
    console.log('Media devices changed');
    
    if (!callState.isInCall || !localStream) {
      return;
    }

    try {
      // Check if current devices are still available
      const devices = await navigator.mediaDevices.enumerateDevices();
      const hasAudio = devices.some(device => device.kind === 'audioinput');
      const hasVideo = devices.some(device => device.kind === 'videoinput');

      const currentAudioTrack = localStream.getAudioTracks()[0];
      const currentVideoTrack = localStream.getVideoTracks()[0];

      // If audio device was removed and we had audio
      if (!hasAudio && currentAudioTrack) {
        console.warn('Audio device removed');
        currentAudioTrack.stop();
        setCallState(prev => ({
          ...prev,
          connection: { ...prev.connection, lastError: 'Microphone disconnected' }
        }));
      }

      // If video device was removed and we had video
      if (!hasVideo && currentVideoTrack) {
        console.warn('Video device removed');
        currentVideoTrack.stop();
        setCallState(prev => ({
          ...prev,
          connection: { ...prev.connection, lastError: 'Camera disconnected' }
        }));
      }

    } catch (error) {
      console.error('Error handling device change:', error);
    }
  }, [callState.isInCall, localStream]);

  // Set up device change monitoring
  useEffect(() => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.addEventListener) {
      return;
    }

    deviceChangeListenerRef.current = handleDeviceChange;
    navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange);

    return () => {
      if (deviceChangeListenerRef.current) {
        navigator.mediaDevices.removeEventListener('devicechange', deviceChangeListenerRef.current);
        deviceChangeListenerRef.current = null;
      }
    };
  }, [handleDeviceChange]);

  // Try next server set for connection recovery
  const tryNextServerSet = useCallback(async () => {
    if (currentServerSet < serverSets.length - 1) {
      console.log(`Trying server set ${currentServerSet + 1}`);
      setCurrentServerSet(prev => prev + 1);
      
      // Reinitialize peer connection with new servers
      if (peerConnection.current) {
        peerConnection.current.close();
        const pc = initializePeerConnection();
        
        // Re-add local stream if available
        if (localStream) {
          localStream.getTracks().forEach(track => {
            pc.addTrack(track, localStream);
          });
        }
        
        return true;
      }
    }
    return false;
  }, [currentServerSet, initializePeerConnection, localStream]);

  // Manual quality control
  const setVideoQuality = useCallback(async (quality: 'auto' | 'high' | 'medium' | 'low') => {
    setQualityMode(quality);
    
    if (quality !== 'auto') {
      await adaptVideoQuality(quality as 'high' | 'medium' | 'low', true);
    } else {
      // Re-evaluate quality based on current connection
      const currentQuality = callState.connection.quality;
      let targetQuality: 'high' | 'medium' | 'low' = 'medium';
      
      if (currentQuality === 'excellent') {
        targetQuality = 'high';
      } else if (currentQuality === 'good') {
        targetQuality = 'medium';
      } else if (currentQuality === 'poor') {
        targetQuality = 'low';
      }
      
      await adaptVideoQuality(targetQuality, true);
    }
  }, [adaptVideoQuality, callState.connection.quality]);

  // Switch to audio-only mode
  const switchToAudioOnly = useCallback(async () => {
    if (!localStream || !peerConnection.current) {
      return;
    }

    try {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        // Stop video track
        videoTrack.stop();
        
        // Remove video sender
        const sender = peerConnection.current.getSenders().find(s => s.track === videoTrack);
        if (sender) {
          await peerConnection.current.removeTrack(sender);
        }

        // Update local stream
        const audioOnlyStream = new MediaStream(localStream.getAudioTracks());
        setLocalStream(audioOnlyStream);
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = null;
        }

        setIsVideoEnabled(false);
        console.log('Switched to audio-only mode');
      }
    } catch (error) {
      console.error('Error switching to audio-only:', error);
      const callError = createUserFriendlyError(error as Error, 'Switching to audio-only');
      setCallState(prev => ({
        ...prev,
        connection: { ...prev.connection, lastError: callError.userMessage, errorDetails: callError }
      }));
    }
  }, [localStream]);

  // Retry connection with error handling and server fallback
  const retryConnectionWithErrorHandling = useCallback(async () => {
    try {
      setCallState(prev => ({
        ...prev,
        connection: { ...prev.connection, isReconnecting: true, lastError: null, errorDetails: null }
      }));

      // First, try to process ICE candidates
      await processIceCandidateQueue();

      // If connection is still failed, try restarting ICE
      if (peerConnection.current && peerConnection.current.connectionState === 'failed') {
        console.log('Attempting to restart ICE');
        try {
          await peerConnection.current.restartIce();
          
          // Wait a bit for ICE restart to take effect
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          if (peerConnection.current.connectionState === 'failed') {
            // If ICE restart failed, try next server set
            const serverChanged = await tryNextServerSet();
            if (!serverChanged) {
              throw new Error('All server configurations failed');
            }
          }
        } catch (iceError) {
          console.error('ICE restart failed:', iceError);
          
          // Try next server set as fallback
          const serverChanged = await tryNextServerSet();
          if (!serverChanged) {
            throw new Error('Connection recovery failed - no more server options');
          }
        }
      }

      setCallState(prev => ({
        ...prev,
        connection: { ...prev.connection, isReconnecting: false }
      }));

    } catch (error) {
      console.error('Error retrying connection:', error);
      const callError = createUserFriendlyError(error as Error, 'Retrying connection');
      
      setCallState(prev => ({
        ...prev,
        connection: { 
          ...prev.connection, 
          isReconnecting: false, 
          lastError: callError.userMessage,
          errorDetails: callError
        }
      }));
    }
  }, [processIceCandidateQueue, tryNextServerSet]);

  // Get user media with adaptive quality and comprehensive error handling
  const getUserMedia = useCallback(async (video: boolean = true, audio: boolean = true, quality: 'high' | 'medium' | 'low' = 'high') => {
    try {
      console.log(`Requesting media: video=${video}, audio=${audio}, quality=${quality}`);

      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('getUserMedia is not supported in this browser');
      }

      const constraints: MediaStreamConstraints = {
        audio: audio ? {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: quality === 'high' ? 48000 : 44100
        } : false,
        video: video ? {
          width: quality === 'high' ? { ideal: 1280, max: 1920 } : quality === 'medium' ? { ideal: 640, max: 1280 } : { ideal: 320, max: 640 },
          height: quality === 'high' ? { ideal: 720, max: 1080 } : quality === 'medium' ? { ideal: 480, max: 720 } : { ideal: 240, max: 480 },
          frameRate: quality === 'high' ? { ideal: 30, max: 60 } : { ideal: 15, max: 30 },
          facingMode: 'user'
        } : false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('Successfully got media stream:', {
        audioTracks: stream.getAudioTracks().length,
        videoTracks: stream.getVideoTracks().length
      });

      setLocalStream(stream);
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Set up track event listeners for device changes
      stream.getTracks().forEach(track => {
        track.addEventListener('ended', () => {
          console.warn(`${track.kind} track ended unexpectedly`);
          setCallState(prev => ({
            ...prev,
            connection: { ...prev.connection, lastError: `${track.kind} device disconnected` }
          }));
        });
      });

      return stream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      
      const callError = createUserFriendlyError(error as Error, 'Media access');
      
      // Handle specific error types with fallback strategies
      if (callError.code === 'PERMISSION_DENIED') {
        // Try audio-only if video permission was denied
        if (video && audio) {
          console.log('Video permission denied, trying audio-only...');
          try {
            return await getUserMedia(false, true, quality);
          } catch (audioError) {
            const audioCallError = createUserFriendlyError(audioError as Error, 'Audio access');
            setCallState(prev => ({
              ...prev,
              connection: { ...prev.connection, lastError: audioCallError.userMessage, errorDetails: audioCallError }
            }));
            throw audioCallError;
          }
        }
        setCallState(prev => ({
          ...prev,
          connection: { ...prev.connection, lastError: callError.userMessage, errorDetails: callError }
        }));
        throw callError;
      }
      
      if (callError.code === 'DEVICE_NOT_FOUND') {
        // Try without video if no camera found
        if (video && audio) {
          console.log('No camera found, trying audio-only...');
          try {
            return await getUserMedia(false, true, quality);
          } catch (audioError) {
            const audioCallError = createUserFriendlyError(audioError as Error, 'Audio device');
            setCallState(prev => ({
              ...prev,
              connection: { ...prev.connection, lastError: audioCallError.userMessage, errorDetails: audioCallError }
            }));
            throw audioCallError;
          }
        }
        setCallState(prev => ({
          ...prev,
          connection: { ...prev.connection, lastError: callError.userMessage, errorDetails: callError }
        }));
        throw callError;
      }
      
      if (callError.code === 'CONSTRAINTS_NOT_SATISFIED') {
        // Fallback: try with lower quality
        if (quality === 'high') {
          console.log('Constraints too strict, retrying with medium quality...');
          return getUserMedia(video, audio, 'medium');
        } else if (quality === 'medium') {
          console.log('Constraints too strict, retrying with low quality...');
          return getUserMedia(video, audio, 'low');
        } else {
          // Last resort: try with minimal constraints
          console.log('Trying with minimal constraints...');
          try {
            const minimalConstraints: MediaStreamConstraints = {
              audio: audio ? true : false,
              video: video ? true : false
            };
            const stream = await navigator.mediaDevices.getUserMedia(minimalConstraints);
            setLocalStream(stream);
            if (localVideoRef.current) {
              localVideoRef.current.srcObject = stream;
            }
            return stream;
          } catch (minimalError) {
            const minimalCallError = createUserFriendlyError(minimalError as Error, 'Minimal constraints');
            setCallState(prev => ({
              ...prev,
              connection: { ...prev.connection, lastError: minimalCallError.userMessage, errorDetails: minimalCallError }
            }));
            throw minimalCallError;
          }
        }
      }
      
      // Generic fallback with retry logic
      if (quality === 'high') {
        console.log('Retrying with medium quality...');
        return getUserMedia(video, audio, 'medium');
      } else if (quality === 'medium') {
        console.log('Retrying with low quality...');
        return getUserMedia(video, audio, 'low');
      }
      
      setCallState(prev => ({
        ...prev,
        connection: { ...prev.connection, lastError: callError.userMessage, errorDetails: callError }
      }));
      throw callError;
    }
  }, []);

  // Start outgoing call
  const startCall = useCallback(async (recipientId: string, recipientName: string, callType: 'audio' | 'video') => {
    try {
      if (!socket) {
        throw new Error('Socket not connected');
      }

      console.log(`Starting ${callType} call to ${recipientName}`);

      // Set initial call state
      setCallState({
        callId: null,
        isInCall: true,
        isIncoming: false,
        isOutgoing: true,
        callType,
        remoteUserId: recipientId,
        remoteUserName: recipientName,
        remoteUserAvatar: null,
        status: 'initiating',
        connection: {
          quality: 'unknown',
          isReconnecting: false,
          lastError: null
        }
      });

      // Get user media first
      const stream = await getUserMedia(callType === 'video', true);
      console.log('Got local media stream');
      
      // Initialize peer connection
      const pc = initializePeerConnection();
      
      // Add local stream to peer connection
      stream.getTracks().forEach(track => {
        console.log(`Adding ${track.kind} track to peer connection`);
        pc.addTrack(track, stream);
      });

      // Create offer with proper options
      const offerOptions: RTCOfferOptions = {
        offerToReceiveAudio: true,
        offerToReceiveVideo: callType === 'video'
      };

      const offer = await pc.createOffer(offerOptions);
      await pc.setLocalDescription(offer);
      console.log('Created and set local description (offer)');

      // Send offer through socket
      socket.emit('callOffer', {
        recipientId,
        offer,
        callType
      });

      console.log('Sent call offer via socket');

      // Set call timeout (30 seconds for ringing)
      callTimeoutRef.current = setTimeout(() => {
        if (callState.status === 'ringing' || callState.status === 'initiating') {
          console.log('Call timed out');
          setCallState(prev => ({
            ...prev,
            status: 'ended',
            connection: { ...prev.connection, lastError: 'Call timed out' }
          }));
          endCall();
        }
      }, 30000);

    } catch (error) {
      console.error('Error starting call:', error);
      
      const callError = createUserFriendlyError(error as Error, 'Starting call');
      
      setCallState(prev => ({
        ...prev,
        status: 'error',
        connection: { ...prev.connection, lastError: callError.userMessage, errorDetails: callError }
      }));
      
      // Clean up on error
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        setLocalStream(null);
      }
      
      throw callError;
    }
  }, [socket, getUserMedia, initializePeerConnection]);

  // Answer incoming call
  const answerCall = useCallback(async () => {
    try {
      if (!socket || !callState.callId || !callState.isIncoming) {
        console.error('Cannot answer call: invalid state');
        return;
      }

      console.log('Answering incoming call');

      // Get user media
      const stream = await getUserMedia(callState.callType === 'video', true);
      console.log('Got local media stream for answer');
      
      // The peer connection should already be initialized from incoming call
      const pc = peerConnection.current;
      if (!pc) {
        throw new Error('No peer connection available');
      }
      
      // Add local stream to peer connection
      stream.getTracks().forEach(track => {
        console.log(`Adding ${track.kind} track to peer connection`);
        pc.addTrack(track, stream);
      });

      // Create answer
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      console.log('Created and set local description (answer)');

      // Send answer through socket
      socket.emit('callAnswer', {
        callId: callState.callId,
        answer
      });

      console.log('Sent call answer via socket');

      setCallState(prev => ({ 
        ...prev, 
        isIncoming: false, 
        status: 'connecting',
        connection: { ...prev.connection, lastError: null, errorDetails: null }
      }));

      // Clear call timeout since we're answering
      clearCallTimeout();

    } catch (error) {
      console.error('Error answering call:', error);
      setCallState(prev => ({
        ...prev,
        status: 'error',
        connection: { ...prev.connection, lastError: error instanceof Error ? error.message : 'Failed to answer call' }
      }));
      rejectCall();
    }
  }, [socket, callState, getUserMedia, clearCallTimeout]);

  // Reject incoming call
  const rejectCall = useCallback(() => {
    console.log('Rejecting call');
    
    if (socket && callState.callId) {
      socket.emit('callReject', { callId: callState.callId });
    }
    
    // Stop connection quality monitoring
    stopConnectionQualityMonitoring();
    
    // Clear call timeout
    clearCallTimeout();
    
    // Clean up streams
    if (localStream) {
      localStream.getTracks().forEach(track => {
        track.stop();
        console.log(`Stopped ${track.kind} track during rejection`);
      });
      setLocalStream(null);
    }
    
    // Close peer connection
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }

    // Clear ICE candidate queue
    iceCandidateQueue.current = [];
    isProcessingCandidates.current = false;
    
    // Reset call state
    setCallState({
      callId: null,
      isInCall: false,
      isIncoming: false,
      isOutgoing: false,
      callType: null,
      remoteUserId: null,
      remoteUserName: null,
      remoteUserAvatar: null,
      status: 'idle',
      connection: {
        quality: 'unknown',
        isReconnecting: false,
        lastError: null,
        errorDetails: null
      }
    });

    setIsConnecting(false);
    setConnectionQuality('unknown');
  }, [socket, callState.callId, localStream, stopConnectionQualityMonitoring, clearCallTimeout]);

  // End call
  const endCall = useCallback(() => {
    console.log('Ending call');

    // Notify backend if we have a call ID
    if (socket && callState.callId) {
      socket.emit('callEnd', { callId: callState.callId });
    }

    // Stop connection quality monitoring
    stopConnectionQualityMonitoring();

    // Clear call timeout
    clearCallTimeout();

    // Clean up streams
    if (localStream) {
      localStream.getTracks().forEach(track => {
        track.stop();
        console.log(`Stopped ${track.kind} track`);
      });
      setLocalStream(null);
    }
    
    if (remoteStream) {
      remoteStream.getTracks().forEach(track => {
        track.stop();
        console.log(`Stopped remote ${track.kind} track`);
      });
      setRemoteStream(null);
    }

    // Close peer connection
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
      console.log('Closed peer connection');
    }

    // Clear ICE candidate queue
    iceCandidateQueue.current = [];
    isProcessingCandidates.current = false;

    // Reset call state
    setCallState({
      callId: null,
      isInCall: false,
      isIncoming: false,
      isOutgoing: false,
      callType: null,
      remoteUserId: null,
      remoteUserName: null,
      remoteUserAvatar: null,
      status: 'idle',
      connection: {
        quality: 'unknown',
        isReconnecting: false,
        lastError: null,
        errorDetails: null
      }
    });

    setIsConnecting(false);
    setConnectionQuality('unknown');
  }, [socket, callState.callId, localStream, remoteStream, stopConnectionQualityMonitoring, clearCallTimeout]);

  // Toggle mute with enhanced reliability
  const toggleMute = useCallback(() => {
    try {
      if (!localStream) {
        console.warn('No local stream available for mute toggle');
        return;
      }

      const audioTrack = localStream.getAudioTracks()[0];
      if (!audioTrack) {
        console.warn('No audio track available for mute toggle');
        return;
      }

      const wasEnabled = audioTrack.enabled;
      audioTrack.enabled = !wasEnabled;
      const newMutedState = !audioTrack.enabled;
      
      setIsMuted(newMutedState);
      console.log(`Audio ${newMutedState ? 'muted' : 'unmuted'}`);

      // Notify remote peer about mute status via data channel if available
      if (peerConnection.current && socket && callState.callId) {
        socket.emit('muteStatusChanged', {
          callId: callState.callId,
          isMuted: newMutedState
        });
      }

    } catch (error) {
      console.error('Error toggling mute:', error);
      setCallState(prev => ({
        ...prev,
        connection: { ...prev.connection, lastError: 'Failed to toggle microphone' }
      }));
    }
  }, [localStream, socket, callState.callId]);

  // Toggle video with enhanced reliability
  const toggleVideo = useCallback(() => {
    try {
      if (!localStream) {
        console.warn('No local stream available for video toggle');
        return;
      }

      const videoTrack = localStream.getVideoTracks()[0];
      if (!videoTrack) {
        console.warn('No video track available for video toggle');
        return;
      }

      const wasEnabled = videoTrack.enabled;
      videoTrack.enabled = !wasEnabled;
      const newVideoState = videoTrack.enabled;
      
      setIsVideoEnabled(newVideoState);
      console.log(`Video ${newVideoState ? 'enabled' : 'disabled'}`);

      // Update local video display
      if (localVideoRef.current) {
        if (newVideoState) {
          localVideoRef.current.srcObject = localStream;
        } else {
          // Show placeholder or hide video element
          localVideoRef.current.srcObject = null;
        }
      }

      // Notify remote peer about video status
      if (peerConnection.current && socket && callState.callId) {
        socket.emit('videoStatusChanged', {
          callId: callState.callId,
          isVideoEnabled: newVideoState
        });
      }

    } catch (error) {
      console.error('Error toggling video:', error);
      setCallState(prev => ({
        ...prev,
        connection: { ...prev.connection, lastError: 'Failed to toggle camera' }
      }));
    }
  }, [localStream, socket, callState.callId]);

  // Handle socket disconnection during calls
  useEffect(() => {
    if (!socket) return;

    const handleSocketDisconnect = () => {
      console.warn('Socket disconnected during call');
      if (callState.isInCall && callState.status !== 'idle') {
        setCallState(prev => ({
          ...prev,
          connection: { ...prev.connection, lastError: 'Connection lost', isReconnecting: true }
        }));
      }
    };

    const handleSocketReconnect = () => {
      console.log('Socket reconnected');
      if (callState.isInCall && callState.connection.isReconnecting) {
        setCallState(prev => ({
          ...prev,
          connection: { ...prev.connection, isReconnecting: false, lastError: null, errorDetails: null }
        }));
      }
    };

    socket.on('disconnect', handleSocketDisconnect);
    socket.on('connect', handleSocketReconnect);

    return () => {
      socket.off('disconnect', handleSocketDisconnect);
      socket.off('connect', handleSocketReconnect);
    };
  }, [socket, callState.isInCall, callState.status, callState.connection.isReconnecting]);

  // Socket event handlers
  useEffect(() => {
    if (!socket) return;

    const handleIncomingCall = async (data: {
      callId: string;
      callerId: string;
      callerName: string;
      callerAvatar?: string;
      callType: 'audio' | 'video';
      offer: RTCSessionDescriptionInit;
    }) => {
      console.log('Incoming call:', data);
      
      try {
        setCallState({
          callId: data.callId,
          isInCall: true,
          isIncoming: true,
          isOutgoing: false,
          callType: data.callType,
          remoteUserId: data.callerId,
          remoteUserName: data.callerName,
          remoteUserAvatar: data.callerAvatar || null,
          status: 'ringing',
          connection: {
            quality: 'unknown',
            isReconnecting: false,
            lastError: null
          }
        });

        // Initialize peer connection and set remote description
        const pc = initializePeerConnection();
        await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
        console.log('Set remote description for incoming call');
        
      } catch (error) {
        console.error('Error handling incoming call:', error);
        setCallState(prev => ({
          ...prev,
          status: 'error',
          connection: { ...prev.connection, lastError: 'Failed to process incoming call' }
        }));
      }
    };

    const handleCallInitiated = (data: { callId: string }) => {
      console.log('Call initiated with ID:', data.callId);
      setCallState(prev => {
        // Only update if we're in the right state
        if (prev.status === 'initiating' && prev.isOutgoing) {
          return { 
            ...prev, 
            callId: data.callId, 
            status: 'ringing' 
          };
        }
        return prev;
      });
    };

    const handleCallAnswered = async (data: { callId: string; answer: RTCSessionDescriptionInit }) => {
      try {
        if (peerConnection.current && data.callId === callState.callId) {
          await peerConnection.current.setRemoteDescription(new RTCSessionDescription(data.answer));
          console.log('Set remote description from call answer');
          
          setCallState(prev => ({ 
            ...prev, 
            status: 'connecting',
            connection: { ...prev.connection, lastError: null, errorDetails: null }
          }));
          
          // Clear call timeout since call was answered
          clearCallTimeout();
          
          // Process any queued ICE candidates
          processIceCandidateQueue();
        }
      } catch (error) {
        console.error('Error handling call answer:', error);
        setCallState(prev => ({
          ...prev,
          status: 'error',
          connection: { ...prev.connection, lastError: 'Failed to process call answer' }
        }));
      }
    };

    const handleCallRejected = (data?: { callId?: string }) => {
      console.log('Call rejected:', data);
      
      // Verify this is for the current call
      if (data?.callId && data.callId !== callState.callId) {
        console.warn('Received rejection for different call ID');
        return;
      }
      
      setCallState(prev => ({ 
        ...prev, 
        status: 'ended',
        connection: { ...prev.connection, lastError: 'Call was rejected' }
      }));
      
      // Clean up after a short delay to show the rejection status
      setTimeout(() => {
        endCall();
      }, 2000);
    };

    const handleCallEnded = (data?: { callId?: string; reason?: string }) => {
      console.log('Call ended:', data);
      
      // Verify this is for the current call
      if (data?.callId && data.callId !== callState.callId) {
        console.warn('Received end signal for different call ID');
        return;
      }
      
      if (data?.reason) {
        setCallState(prev => ({
          ...prev,
          connection: { ...prev.connection, lastError: `Call ended: ${data.reason}` }
        }));
      }
      
      endCall();
    };

    const handleCallFailed = (data: { error: string; callId?: string }) => {
      console.error('Call failed:', data.error);
      
      // Verify this is for the current call
      if (data.callId && data.callId !== callState.callId) {
        console.warn('Received failure for different call ID');
        return;
      }
      
      setCallState(prev => ({ 
        ...prev, 
        status: 'error',
        connection: { ...prev.connection, lastError: data.error }
      }));
      
      // Clean up after showing error
      setTimeout(() => {
        endCall();
      }, 3000);
    };

    const handleIceCandidate = async (data: { candidate: RTCIceCandidateInit }) => {
      try {
        if (!peerConnection.current) {
          console.warn('Received ICE candidate but no peer connection');
          return;
        }

        const candidate = new RTCIceCandidate(data.candidate);
        
        // If remote description is set, add candidate immediately
        if (peerConnection.current.remoteDescription) {
          await peerConnection.current.addIceCandidate(candidate);
          console.log('Added ICE candidate immediately');
        } else {
          // Queue candidate for later processing
          iceCandidateQueue.current.push(candidate);
          console.log('Queued ICE candidate for later processing');
        }
      } catch (error) {
        console.error('Error handling ICE candidate:', error);
        // Don't fail the call for ICE candidate errors
      }
    };

    // Handle remote mute status changes
    const handleRemoteMuteStatusChanged = (data: { callId: string; isMuted: boolean }) => {
      if (data.callId === callState.callId) {
        console.log(`Remote user ${data.isMuted ? 'muted' : 'unmuted'} their microphone`);
        // You could show a visual indicator here
        setCallState(prev => ({
          ...prev,
          connection: { 
            ...prev.connection, 
            lastError: data.isMuted ? 'Remote user muted their microphone' : null 
          }
        }));
      }
    };

    // Handle remote video status changes
    const handleRemoteVideoStatusChanged = (data: { callId: string; isVideoEnabled: boolean }) => {
      if (data.callId === callState.callId) {
        console.log(`Remote user ${data.isVideoEnabled ? 'enabled' : 'disabled'} their camera`);
        // You could show a visual indicator here
        setCallState(prev => ({
          ...prev,
          connection: { 
            ...prev.connection, 
            lastError: data.isVideoEnabled ? null : 'Remote user disabled their camera'
          }
        }));
      }
    };

    // Register event listeners
    socket.on('incomingCall', handleIncomingCall);
    socket.on('callInitiated', handleCallInitiated);
    socket.on('callAnswered', handleCallAnswered);
    socket.on('callRejected', handleCallRejected);
    socket.on('callEnded', handleCallEnded);
    socket.on('callFailed', handleCallFailed);
    socket.on('iceCandidate', handleIceCandidate);
    socket.on('muteStatusChanged', handleRemoteMuteStatusChanged);
    socket.on('videoStatusChanged', handleRemoteVideoStatusChanged);

    return () => {
      socket.off('incomingCall', handleIncomingCall);
      socket.off('callInitiated', handleCallInitiated);
      socket.off('callAnswered', handleCallAnswered);
      socket.off('callRejected', handleCallRejected);
      socket.off('callEnded', handleCallEnded);
      socket.off('callFailed', handleCallFailed);
      socket.off('iceCandidate', handleIceCandidate);
      socket.off('muteStatusChanged', handleRemoteMuteStatusChanged);
      socket.off('videoStatusChanged', handleRemoteVideoStatusChanged);
    };
  }, [socket, processIceCandidateQueue, callState.callId, clearCallTimeout]);

  // Update video elements when streams change
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log('Cleaning up WebRTC hook');
      
      // Stop all streams
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      if (remoteStream) {
        remoteStream.getTracks().forEach(track => track.stop());
      }
      
      // Close peer connection
      if (peerConnection.current) {
        peerConnection.current.close();
      }
      
      // Clear intervals and timeouts
      if (connectionMonitorInterval.current) {
        clearInterval(connectionMonitorInterval.current);
      }
      if (callTimeoutRef.current) {
        clearTimeout(callTimeoutRef.current);
      }
      
      // Remove device change listener
      if (deviceChangeListenerRef.current && navigator.mediaDevices) {
        navigator.mediaDevices.removeEventListener('devicechange', deviceChangeListenerRef.current);
      }
    };
  }, [localStream, remoteStream]);

  return {
    callState,
    localStream,
    remoteStream,
    isMuted,
    isVideoEnabled,
    connectionQuality,
    connectionMetrics,
    qualityMode,
    currentVideoQuality,
    isConnecting,
    localVideoRef,
    remoteVideoRef,
    startCall,
    answerCall,
    rejectCall,
    endCall,
    toggleMute,
    toggleVideo,
    // New methods for enhanced functionality
    retryConnection: retryConnectionWithErrorHandling,
    switchToAudioOnly,
    setVideoQuality
  };
};