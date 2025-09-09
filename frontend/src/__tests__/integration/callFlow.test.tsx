import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CallProvider } from '../../context/CallContext';
import { UserSearch } from '../../components/messaging/UserSearch';
import { MessageThread } from '../../components/messaging/MessageThread';

// Mock socket context
const mockSocket = {
  emit: jest.fn(),
  on: jest.fn(),
  off: jest.fn()
};

jest.mock('../../context/SocketContext', () => ({
  useSocket: () => ({ socket: mockSocket })
}));

// Mock auth context
jest.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'current-user', name: 'Current User' }
  })
}));

// Mock message service
jest.mock('../../services/messageService', () => ({
  getUsersForMessaging: jest.fn(() => Promise.resolve({
    users: [
      {
        _id: 'user123',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'farmer',
        profileImage: 'https://example.com/avatar.jpg'
      }
    ]
  })),
  createConversation: jest.fn(() => Promise.resolve({
    _id: 'conv123',
    participants: []
  })),
  getConversationMessages: jest.fn(() => Promise.resolve({
    messages: []
  })),
  markConversationAsRead: jest.fn(() => Promise.resolve())
}));

// Mock WebRTC APIs
const mockPeerConnection = {
  createOffer: jest.fn(() => Promise.resolve({ type: 'offer', sdp: 'mock-sdp' })),
  createAnswer: jest.fn(() => Promise.resolve({ type: 'answer', sdp: 'mock-sdp' })),
  setLocalDescription: jest.fn(() => Promise.resolve()),
  setRemoteDescription: jest.fn(() => Promise.resolve()),
  addTrack: jest.fn(),
  addIceCandidate: jest.fn(() => Promise.resolve()),
  close: jest.fn(),
  restartIce: jest.fn(() => Promise.resolve()),
  getSenders: jest.fn(() => []),
  getStats: jest.fn(() => Promise.resolve(new Map())),
  connectionState: 'new',
  iceConnectionState: 'new',
  signalingState: 'stable',
  remoteDescription: null,
  ontrack: null,
  onicecandidate: null,
  onconnectionstatechange: null,
  oniceconnectionstatechange: null,
  onsignalingstatechange: null
};

const mockMediaStream = {
  getTracks: jest.fn(() => []),
  getAudioTracks: jest.fn(() => []),
  getVideoTracks: jest.fn(() => [])
};

// Setup global mocks
beforeAll(() => {
  global.RTCPeerConnection = jest.fn(() => mockPeerConnection) as any;
  global.RTCSessionDescription = jest.fn() as any;
  global.RTCIceCandidate = jest.fn() as any;
  
  Object.defineProperty(global.navigator, 'mediaDevices', {
    value: {
      getUserMedia: jest.fn(() => Promise.resolve(mockMediaStream)),
      enumerateDevices: jest.fn(() => Promise.resolve([])),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn()
    },
    writable: true
  });
});

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  return (
    <QueryClientProvider client={queryClient}>
      <CallProvider>
        {children}
      </CallProvider>
    </QueryClientProvider>
  );
};

describe('Call Flow Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPeerConnection.connectionState = 'new';
    mockPeerConnection.iceConnectionState = 'new';
    mockSocket.emit.mockClear();
    mockSocket.on.mockClear();
  });

  describe('Outgoing Call Flow', () => {
    it('should complete successful video call initiation', async () => {
      const onConversationCreated = jest.fn();
      
      render(
        <TestWrapper>
          <UserSearch onConversationCreated={onConversationCreated} />
        </TestWrapper>
      );

      // Wait for users to load
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      // Click video call button
      const videoCallButton = screen.getByTitle('Video call');
      fireEvent.click(videoCallButton);

      // Verify media access was requested
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

      // Verify peer connection was created
      expect(RTCPeerConnection).toHaveBeenCalled();

      // Verify offer was created
      expect(mockPeerConnection.createOffer).toHaveBeenCalled();
      expect(mockPeerConnection.setLocalDescription).toHaveBeenCalled();

      // Verify socket emit for call offer
      expect(mockSocket.emit).toHaveBeenCalledWith('callOffer', {
        recipientId: 'user123',
        offer: { type: 'offer', sdp: 'mock-sdp' },
        callType: 'video'
      });
    });

    it('should complete successful audio call initiation', async () => {
      const onConversationCreated = jest.fn();
      
      render(
        <TestWrapper>
          <UserSearch onConversationCreated={onConversationCreated} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      // Click audio call button
      const audioCallButton = screen.getByTitle('Audio call');
      fireEvent.click(audioCallButton);

      // Verify audio-only media access
      expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000
        },
        video: false
      });

      // Verify socket emit for audio call
      expect(mockSocket.emit).toHaveBeenCalledWith('callOffer', {
        recipientId: 'user123',
        offer: { type: 'offer', sdp: 'mock-sdp' },
        callType: 'audio'
      });
    });

    it('should handle call initiation failure gracefully', async () => {
      // Mock getUserMedia to fail
      (navigator.mediaDevices.getUserMedia as jest.Mock).mockRejectedValueOnce(
        new Error('Permission denied')
      );

      const onConversationCreated = jest.fn();
      
      render(
        <TestWrapper>
          <UserSearch onConversationCreated={onConversationCreated} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      const videoCallButton = screen.getByTitle('Video call');
      fireEvent.click(videoCallButton);

      // Should not emit call offer on failure
      await waitFor(() => {
        expect(mockSocket.emit).not.toHaveBeenCalledWith(
          'callOffer',
          expect.any(Object)
        );
      });
    });
  });

  describe('Incoming Call Flow', () => {
    it('should handle incoming call correctly', async () => {
      const mockConversation = {
        _id: 'conv123',
        participants: [
          { _id: 'current-user', name: 'Current User' },
          { _id: 'caller123', name: 'Caller User' }
        ],
        unreadCount: 0
      };

      render(
        <TestWrapper>
          <MessageThread 
            conversation={mockConversation}
            onConversationUpdate={jest.fn()}
          />
        </TestWrapper>
      );

      // Simulate incoming call event
      const socketOnCalls = mockSocket.on.mock.calls;
      const incomingCallHandler = socketOnCalls.find(call => call[0] === 'incomingCall')?.[1];

      if (incomingCallHandler) {
        incomingCallHandler({
          callId: 'incoming-call-123',
          callerId: 'caller123',
          callerName: 'Caller User',
          callType: 'video',
          offer: { type: 'offer', sdp: 'incoming-sdp' }
        });
      }

      // Should show incoming call modal
      await waitFor(() => {
        expect(screen.getByText('Caller User')).toBeInTheDocument();
        expect(screen.getByText('Incoming video call')).toBeInTheDocument();
      });
    });

    it('should handle call answer flow', async () => {
      const mockConversation = {
        _id: 'conv123',
        participants: [
          { _id: 'current-user', name: 'Current User' },
          { _id: 'caller123', name: 'Caller User' }
        ],
        unreadCount: 0
      };

      render(
        <TestWrapper>
          <MessageThread 
            conversation={mockConversation}
            onConversationUpdate={jest.fn()}
          />
        </TestWrapper>
      );

      // Simulate incoming call
      const socketOnCalls = mockSocket.on.mock.calls;
      const incomingCallHandler = socketOnCalls.find(call => call[0] === 'incomingCall')?.[1];

      if (incomingCallHandler) {
        incomingCallHandler({
          callId: 'incoming-call-123',
          callerId: 'caller123',
          callerName: 'Caller User',
          callType: 'video',
          offer: { type: 'offer', sdp: 'incoming-sdp' }
        });
      }

      await waitFor(() => {
        expect(screen.getByText('Caller User')).toBeInTheDocument();
      });

      // Click answer button
      const answerButton = screen.getByTitle('Answer call') || 
                          screen.getByRole('button', { name: /answer/i });
      fireEvent.click(answerButton);

      // Verify media access for answering
      expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalled();

      // Verify answer creation and socket emit
      expect(mockPeerConnection.createAnswer).toHaveBeenCalled();
      expect(mockSocket.emit).toHaveBeenCalledWith('callAnswer', {
        callId: 'incoming-call-123',
        answer: { type: 'answer', sdp: 'mock-sdp' }
      });
    });

    it('should handle call rejection', async () => {
      const mockConversation = {
        _id: 'conv123',
        participants: [
          { _id: 'current-user', name: 'Current User' },
          { _id: 'caller123', name: 'Caller User' }
        ],
        unreadCount: 0
      };

      render(
        <TestWrapper>
          <MessageThread 
            conversation={mockConversation}
            onConversationUpdate={jest.fn()}
          />
        </TestWrapper>
      );

      // Simulate incoming call
      const socketOnCalls = mockSocket.on.mock.calls;
      const incomingCallHandler = socketOnCalls.find(call => call[0] === 'incomingCall')?.[1];

      if (incomingCallHandler) {
        incomingCallHandler({
          callId: 'incoming-call-123',
          callerId: 'caller123',
          callerName: 'Caller User',
          callType: 'video',
          offer: { type: 'offer', sdp: 'incoming-sdp' }
        });
      }

      await waitFor(() => {
        expect(screen.getByText('Caller User')).toBeInTheDocument();
      });

      // Click reject button
      const rejectButton = screen.getByTitle('Reject call') || 
                          screen.getByRole('button', { name: /reject/i });
      fireEvent.click(rejectButton);

      // Verify socket emit for rejection
      expect(mockSocket.emit).toHaveBeenCalledWith('callReject', {
        callId: 'incoming-call-123'
      });
    });
  });

  describe('Call Connection Flow', () => {
    it('should handle successful call connection', async () => {
      const onConversationCreated = jest.fn();
      
      render(
        <TestWrapper>
          <UserSearch onConversationCreated={onConversationCreated} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      // Start call
      const videoCallButton = screen.getByTitle('Video call');
      fireEvent.click(videoCallButton);

      // Simulate call initiated response
      const socketOnCalls = mockSocket.on.mock.calls;
      const callInitiatedHandler = socketOnCalls.find(call => call[0] === 'callInitiated')?.[1];

      if (callInitiatedHandler) {
        callInitiatedHandler({
          callId: 'test-call-123',
          recipientId: 'user123',
          callType: 'video'
        });
      }

      // Simulate call answered
      const callAnsweredHandler = socketOnCalls.find(call => call[0] === 'callAnswered')?.[1];

      if (callAnsweredHandler) {
        callAnsweredHandler({
          callId: 'test-call-123',
          answer: { type: 'answer', sdp: 'answer-sdp' }
        });
      }

      // Verify remote description was set
      expect(mockPeerConnection.setRemoteDescription).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'answer',
          sdp: 'answer-sdp'
        })
      );

      // Simulate ICE connection success
      mockPeerConnection.iceConnectionState = 'connected';
      if (mockPeerConnection.oniceconnectionstatechange) {
        mockPeerConnection.oniceconnectionstatechange({} as Event);
      }

      // Should show connected call interface
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
    });

    it('should handle ICE candidate exchange', async () => {
      const onConversationCreated = jest.fn();
      
      render(
        <TestWrapper>
          <UserSearch onConversationCreated={onConversationCreated} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      // Start call
      const videoCallButton = screen.getByTitle('Video call');
      fireEvent.click(videoCallButton);

      // Simulate ICE candidate received
      const socketOnCalls = mockSocket.on.mock.calls;
      const iceCandidateHandler = socketOnCalls.find(call => call[0] === 'iceCandidate')?.[1];

      if (iceCandidateHandler) {
        iceCandidateHandler({
          callId: 'test-call-123',
          candidate: {
            candidate: 'candidate:1 1 UDP 2130706431 192.168.1.1 54400 typ host',
            sdpMLineIndex: 0,
            sdpMid: '0'
          }
        });
      }

      // Should attempt to add ICE candidate
      expect(mockPeerConnection.addIceCandidate).toHaveBeenCalled();
    });
  });

  describe('Call Controls', () => {
    it('should handle mute toggle during call', async () => {
      const mockAudioTrack = {
        kind: 'audio',
        enabled: true,
        stop: jest.fn()
      };

      const mockStreamWithAudio = {
        ...mockMediaStream,
        getAudioTracks: jest.fn(() => [mockAudioTrack])
      };

      (navigator.mediaDevices.getUserMedia as jest.Mock).mockResolvedValue(mockStreamWithAudio);

      const onConversationCreated = jest.fn();
      
      render(
        <TestWrapper>
          <UserSearch onConversationCreated={onConversationCreated} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      // Start call
      const videoCallButton = screen.getByTitle('Video call');
      fireEvent.click(videoCallButton);

      // Wait for call interface to appear
      await waitFor(() => {
        expect(screen.getByTitle('Mute microphone')).toBeInTheDocument();
      });

      // Click mute button
      const muteButton = screen.getByTitle('Mute microphone');
      fireEvent.click(muteButton);

      // Verify track was disabled
      expect(mockAudioTrack.enabled).toBe(false);

      // Verify socket notification
      expect(mockSocket.emit).toHaveBeenCalledWith('muteStatusChanged', {
        callId: expect.any(String),
        isMuted: true
      });
    });

    it('should handle video toggle during call', async () => {
      const mockVideoTrack = {
        kind: 'video',
        enabled: true,
        stop: jest.fn()
      };

      const mockStreamWithVideo = {
        ...mockMediaStream,
        getVideoTracks: jest.fn(() => [mockVideoTrack])
      };

      (navigator.mediaDevices.getUserMedia as jest.Mock).mockResolvedValue(mockStreamWithVideo);

      const onConversationCreated = jest.fn();
      
      render(
        <TestWrapper>
          <UserSearch onConversationCreated={onConversationCreated} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      // Start call
      const videoCallButton = screen.getByTitle('Video call');
      fireEvent.click(videoCallButton);

      // Wait for call interface
      await waitFor(() => {
        expect(screen.getByTitle('Turn off camera')).toBeInTheDocument();
      });

      // Click video toggle
      const videoToggleButton = screen.getByTitle('Turn off camera');
      fireEvent.click(videoToggleButton);

      // Verify track was disabled
      expect(mockVideoTrack.enabled).toBe(false);

      // Verify socket notification
      expect(mockSocket.emit).toHaveBeenCalledWith('videoStatusChanged', {
        callId: expect.any(String),
        isVideoEnabled: false
      });
    });
  });

  describe('Error Scenarios', () => {
    it('should handle call failure gracefully', async () => {
      const onConversationCreated = jest.fn();
      
      render(
        <TestWrapper>
          <UserSearch onConversationCreated={onConversationCreated} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      // Start call
      const videoCallButton = screen.getByTitle('Video call');
      fireEvent.click(videoCallButton);

      // Simulate call failure
      const socketOnCalls = mockSocket.on.mock.calls;
      const callFailedHandler = socketOnCalls.find(call => call[0] === 'callFailed')?.[1];

      if (callFailedHandler) {
        callFailedHandler({
          error: 'User is offline',
          callId: 'test-call-123'
        });
      }

      // Should show error state
      await waitFor(() => {
        expect(screen.getByText('Call Failed')).toBeInTheDocument();
        expect(screen.getByText('User is offline')).toBeInTheDocument();
      });
    });

    it('should handle network disconnection during call', async () => {
      const onConversationCreated = jest.fn();
      
      render(
        <TestWrapper>
          <UserSearch onConversationCreated={onConversationCreated} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      // Start call and establish connection
      const videoCallButton = screen.getByTitle('Video call');
      fireEvent.click(videoCallButton);

      // Simulate socket disconnect
      const socketOnCalls = mockSocket.on.mock.calls;
      const disconnectHandler = socketOnCalls.find(call => call[0] === 'disconnect')?.[1];

      if (disconnectHandler) {
        disconnectHandler();
      }

      // Should show reconnecting state
      await waitFor(() => {
        expect(screen.getByText('Reconnecting...')).toBeInTheDocument();
      });
    });
  });
});