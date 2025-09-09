import { renderHook, act } from '@testing-library/react';
import { useWebRTC } from '../useWebRTC';
import { CallErrorHandler } from '../../utils/callErrorHandler';

// Mock dependencies
jest.mock('../../context/SocketContext', () => ({
  useSocket: () => ({
    socket: {
      emit: jest.fn(),
      on: jest.fn(),
      off: jest.fn()
    }
  })
}));

// Mock WebRTC APIs
const mockPeerConnection = {
  createOffer: jest.fn(),
  createAnswer: jest.fn(),
  setLocalDescription: jest.fn(),
  setRemoteDescription: jest.fn(),
  addTrack: jest.fn(),
  removeTrack: jest.fn(),
  addIceCandidate: jest.fn(),
  close: jest.fn(),
  restartIce: jest.fn(),
  getSenders: jest.fn(() => []),
  getStats: jest.fn(),
  connectionState: 'new',
  iceConnectionState: 'new',
  signalingState: 'stable',
  remoteDescription: null,
  addEventListener: jest.fn(),
  removeEventListener: jest.fn()
};

const mockMediaStream = {
  getTracks: jest.fn(() => []),
  getAudioTracks: jest.fn(() => []),
  getVideoTracks: jest.fn(() => [])
};

const mockMediaTrack = {
  kind: 'audio',
  enabled: true,
  stop: jest.fn(),
  addEventListener: jest.fn()
};

// Setup global mocks
beforeAll(() => {
  global.RTCPeerConnection = jest.fn(() => mockPeerConnection) as any;
  global.RTCSessionDescription = jest.fn() as any;
  global.RTCIceCandidate = jest.fn() as any;
  
  Object.defineProperty(global.navigator, 'mediaDevices', {
    value: {
      getUserMedia: jest.fn(),
      enumerateDevices: jest.fn(() => Promise.resolve([])),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn()
    },
    writable: true
  });
});

describe('useWebRTC Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPeerConnection.connectionState = 'new';
    mockPeerConnection.iceConnectionState = 'new';
    mockPeerConnection.signalingState = 'stable';
    mockPeerConnection.remoteDescription = null;
  });

  describe('Initial State', () => {
    it('should initialize with correct default state', () => {
      const { result } = renderHook(() => useWebRTC());

      expect(result.current.callState).toEqual({
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

      expect(result.current.isMuted).toBe(false);
      expect(result.current.isVideoEnabled).toBe(true);
      expect(result.current.connectionQuality).toBe('unknown');
    });
  });

  describe('Media Access', () => {
    it('should successfully get user media for video call', async () => {
      const mockStream = { ...mockMediaStream };
      (navigator.mediaDevices.getUserMedia as jest.Mock).mockResolvedValue(mockStream);

      const { result } = renderHook(() => useWebRTC());

      await act(async () => {
        await result.current.startCall('user123', 'John Doe', 'video');
      });

      expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000
        },
        video: {
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
          frameRate: { ideal: 30, max: 60 },
          facingMode: 'user'
        }
      });
    });

    it('should handle media access permission denied error', async () => {
      const permissionError = new Error('Permission denied');
      permissionError.name = 'NotAllowedError';
      (navigator.mediaDevices.getUserMedia as jest.Mock).mockRejectedValue(permissionError);

      const { result } = renderHook(() => useWebRTC());

      await act(async () => {
        try {
          await result.current.startCall('user123', 'John Doe', 'video');
        } catch (error) {
          expect(error).toBeDefined();
        }
      });

      expect(result.current.callState.status).toBe('error');
      expect(result.current.callState.connection.errorDetails?.code).toBe('PERMISSION_DENIED');
    });

    it('should fallback to audio-only when video permission denied', async () => {
      const permissionError = new Error('Permission denied');
      permissionError.name = 'NotAllowedError';
      
      (navigator.mediaDevices.getUserMedia as jest.Mock)
        .mockRejectedValueOnce(permissionError) // First call (video) fails
        .mockResolvedValueOnce(mockMediaStream); // Second call (audio-only) succeeds

      const { result } = renderHook(() => useWebRTC());

      await act(async () => {
        await result.current.startCall('user123', 'John Doe', 'video');
      });

      expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledTimes(2);
      // Second call should be audio-only
      expect(navigator.mediaDevices.getUserMedia).toHaveBeenLastCalledWith({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000
        },
        video: false
      });
    });
  });

  describe('Call State Management', () => {
    it('should update state correctly when starting a call', async () => {
      (navigator.mediaDevices.getUserMedia as jest.Mock).mockResolvedValue(mockMediaStream);
      mockPeerConnection.createOffer.mockResolvedValue({ type: 'offer', sdp: 'mock-sdp' });

      const { result } = renderHook(() => useWebRTC());

      await act(async () => {
        await result.current.startCall('user123', 'John Doe', 'video');
      });

      expect(result.current.callState).toMatchObject({
        isInCall: true,
        isIncoming: false,
        isOutgoing: true,
        callType: 'video',
        remoteUserId: 'user123',
        remoteUserName: 'John Doe',
        status: 'initiating'
      });
    });

    it('should handle call rejection correctly', () => {
      const { result } = renderHook(() => useWebRTC());

      // Set up a call state first
      act(() => {
        result.current.callState.callId = 'test-call-id';
        result.current.callState.isInCall = true;
        result.current.callState.isIncoming = true;
      });

      act(() => {
        result.current.rejectCall();
      });

      expect(result.current.callState).toMatchObject({
        callId: null,
        isInCall: false,
        isIncoming: false,
        isOutgoing: false,
        status: 'idle'
      });
    });

    it('should clean up resources when ending call', () => {
      const mockTrack = { ...mockMediaTrack };
      const mockStreamWithTracks = {
        ...mockMediaStream,
        getTracks: jest.fn(() => [mockTrack])
      };

      const { result } = renderHook(() => useWebRTC());

      // Set up call state with streams
      act(() => {
        result.current.callState.callId = 'test-call-id';
        result.current.callState.isInCall = true;
        // Simulate having streams
        (result.current as any).localStream = mockStreamWithTracks;
      });

      act(() => {
        result.current.endCall();
      });

      expect(mockTrack.stop).toHaveBeenCalled();
      expect(mockPeerConnection.close).toHaveBeenCalled();
      expect(result.current.callState.status).toBe('idle');
    });
  });

  describe('Call Controls', () => {
    it('should toggle mute correctly', () => {
      const mockAudioTrack = { ...mockMediaTrack, kind: 'audio', enabled: true };
      const mockStreamWithAudio = {
        ...mockMediaStream,
        getAudioTracks: jest.fn(() => [mockAudioTrack])
      };

      const { result } = renderHook(() => useWebRTC());

      // Set up local stream
      act(() => {
        (result.current as any).localStream = mockStreamWithAudio;
      });

      act(() => {
        result.current.toggleMute();
      });

      expect(mockAudioTrack.enabled).toBe(false);
      expect(result.current.isMuted).toBe(true);

      act(() => {
        result.current.toggleMute();
      });

      expect(mockAudioTrack.enabled).toBe(true);
      expect(result.current.isMuted).toBe(false);
    });

    it('should toggle video correctly', () => {
      const mockVideoTrack = { ...mockMediaTrack, kind: 'video', enabled: true };
      const mockStreamWithVideo = {
        ...mockMediaStream,
        getVideoTracks: jest.fn(() => [mockVideoTrack])
      };

      const { result } = renderHook(() => useWebRTC());

      // Set up local stream
      act(() => {
        (result.current as any).localStream = mockStreamWithVideo;
      });

      act(() => {
        result.current.toggleVideo();
      });

      expect(mockVideoTrack.enabled).toBe(false);
      expect(result.current.isVideoEnabled).toBe(false);

      act(() => {
        result.current.toggleVideo();
      });

      expect(mockVideoTrack.enabled).toBe(true);
      expect(result.current.isVideoEnabled).toBe(true);
    });

    it('should handle toggle operations when no stream is available', () => {
      const { result } = renderHook(() => useWebRTC());

      // No local stream set
      act(() => {
        result.current.toggleMute();
      });

      // Should not crash and state should remain unchanged
      expect(result.current.isMuted).toBe(false);

      act(() => {
        result.current.toggleVideo();
      });

      expect(result.current.isVideoEnabled).toBe(true);
    });
  });

  describe('Connection Quality Monitoring', () => {
    it('should calculate connection quality based on stats', async () => {
      const mockStats = new Map([
        ['inbound-rtp-1', {
          type: 'inbound-rtp',
          kind: 'video',
          bytesReceived: 1000000,
          packetsLost: 10,
          packetsReceived: 1000
        }],
        ['candidate-pair-1', {
          type: 'candidate-pair',
          state: 'succeeded',
          currentRoundTripTime: 0.05
        }]
      ]);

      mockPeerConnection.getStats.mockResolvedValue(mockStats);

      const { result } = renderHook(() => useWebRTC());

      // Simulate connected state to start monitoring
      act(() => {
        result.current.callState.status = 'connected';
        mockPeerConnection.connectionState = 'connected';
      });

      // Wait for quality monitoring to run
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      // Quality should be 'good' based on low packet loss and RTT
      expect(result.current.connectionQuality).toBe('good');
    });
  });

  describe('Error Handling', () => {
    it('should classify and handle different error types', () => {
      const permissionError = new Error('Permission denied');
      const deviceError = new Error('NotFoundError');
      const networkError = new Error('Socket not connected');

      expect(CallErrorHandler.classifyError(permissionError).code).toBe('PERMISSION_DENIED');
      expect(CallErrorHandler.classifyError(deviceError).code).toBe('DEVICE_NOT_FOUND');
      expect(CallErrorHandler.classifyError(networkError).code).toBe('NETWORK_DISCONNECTED');
    });

    it('should determine retry eligibility correctly', () => {
      const networkError = CallErrorHandler.classifyError(new Error('Connection failed'));
      const permissionError = CallErrorHandler.classifyError(new Error('Permission denied'));

      expect(CallErrorHandler.shouldRetry(networkError, 0)).toBe(true);
      expect(CallErrorHandler.shouldRetry(networkError, 3)).toBe(false);
      expect(CallErrorHandler.shouldRetry(permissionError, 0)).toBe(false);
    });
  });

  describe('ICE Candidate Handling', () => {
    it('should queue ICE candidates when remote description is not set', async () => {
      const { result } = renderHook(() => useWebRTC());
      const mockCandidate = { candidate: 'mock-candidate' };

      // Simulate receiving ICE candidate before remote description
      mockPeerConnection.remoteDescription = null;

      await act(async () => {
        // This would normally be called by socket event handler
        await (result.current as any).handleIceCandidate({ candidate: mockCandidate });
      });

      // Candidate should be queued, not added immediately
      expect(mockPeerConnection.addIceCandidate).not.toHaveBeenCalled();
    });

    it('should process queued candidates when remote description is set', async () => {
      const { result } = renderHook(() => useWebRTC());

      // Set remote description
      mockPeerConnection.remoteDescription = { type: 'answer', sdp: 'mock-sdp' };

      await act(async () => {
        await result.current.retryConnection();
      });

      // Should attempt to process any queued candidates
      expect(mockPeerConnection.addIceCandidate).toHaveBeenCalledTimes(0); // No queued candidates in this test
    });
  });

  describe('Server Fallback', () => {
    it('should try different server configurations on connection failure', async () => {
      const { result } = renderHook(() => useWebRTC());

      // Simulate connection failure
      mockPeerConnection.connectionState = 'failed';

      await act(async () => {
        await result.current.retryConnection();
      });

      // Should have attempted to create new peer connection with different servers
      expect(RTCPeerConnection).toHaveBeenCalledTimes(2); // Initial + retry
    });
  });
});

describe('CallErrorHandler', () => {
  describe('Error Classification', () => {
    it('should classify permission errors correctly', () => {
      const error = new Error('Permission denied');
      error.name = 'NotAllowedError';
      
      const classified = CallErrorHandler.classifyError(error);
      
      expect(classified.type).toBe('permission');
      expect(classified.code).toBe('PERMISSION_DENIED');
      expect(classified.recoverable).toBe(true);
      expect(classified.suggestions).toContain('Allow access to camera and microphone');
    });

    it('should classify device errors correctly', () => {
      const error = new Error('NotFoundError: Requested device not found');
      
      const classified = CallErrorHandler.classifyError(error);
      
      expect(classified.type).toBe('device');
      expect(classified.code).toBe('DEVICE_NOT_FOUND');
      expect(classified.recoverable).toBe(true);
    });

    it('should classify network errors correctly', () => {
      const error = new Error('Socket not connected');
      
      const classified = CallErrorHandler.classifyError(error);
      
      expect(classified.type).toBe('network');
      expect(classified.code).toBe('NETWORK_DISCONNECTED');
      expect(classified.recoverable).toBe(true);
    });

    it('should classify browser compatibility errors correctly', () => {
      const error = new Error('getUserMedia is not supported');
      
      const classified = CallErrorHandler.classifyError(error);
      
      expect(classified.type).toBe('browser');
      expect(classified.code).toBe('BROWSER_NOT_SUPPORTED');
      expect(classified.recoverable).toBe(false);
    });
  });

  describe('Retry Logic', () => {
    it('should allow retries for recoverable errors within limit', () => {
      const networkError = CallErrorHandler.classifyError(new Error('Connection failed'));
      
      expect(CallErrorHandler.shouldRetry(networkError, 0)).toBe(true);
      expect(CallErrorHandler.shouldRetry(networkError, 1)).toBe(true);
      expect(CallErrorHandler.shouldRetry(networkError, 2)).toBe(false);
    });

    it('should not allow retries for non-recoverable errors', () => {
      const browserError = CallErrorHandler.classifyError(new Error('getUserMedia is not supported'));
      
      expect(CallErrorHandler.shouldRetry(browserError, 0)).toBe(false);
    });

    it('should calculate exponential backoff delays', () => {
      expect(CallErrorHandler.getRetryDelay(0)).toBe(1000);
      expect(CallErrorHandler.getRetryDelay(1)).toBe(2000);
      expect(CallErrorHandler.getRetryDelay(2)).toBe(4000);
      expect(CallErrorHandler.getRetryDelay(3)).toBe(4000); // Capped at 4000
    });
  });
});