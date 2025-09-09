# Design Document

## Overview

The current calling system suffers from several critical issues that cause calls to automatically end:

1. **WebRTC Connection Issues**: Improper peer connection initialization and ICE candidate handling
2. **Socket Event Timing**: Race conditions between offer/answer exchange and connection setup
3. **State Management**: Inconsistent call state transitions leading to premature call termination
4. **Error Handling**: Insufficient error recovery mechanisms
5. **Media Stream Management**: Improper cleanup and stream handling

This design addresses these issues with a robust, fault-tolerant calling system that ensures reliable audio and video communication.

## Architecture

### Core Components

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   CallContext   │    │   useWebRTC     │    │ Socket Handler  │
│                 │    │                 │    │                 │
│ - Call State    │◄──►│ - Peer Conn     │◄──►│ - Call Events   │
│ - UI Controls   │    │ - Media Streams │    │ - ICE Exchange  │
│ - Error Mgmt    │    │ - Connection    │    │ - State Sync    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Call Interface  │    │ Media Manager   │    │ Backend API     │
│                 │    │                 │    │                 │
│ - Incoming UI   │    │ - Stream Setup  │    │ - Call Storage  │
│ - Active UI     │    │ - Quality Mgmt  │    │ - User Status   │
│ - Controls      │    │ - Device Access │    │ - Cleanup       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Call Flow State Machine

```
[Idle] ──startCall──► [Initiating] ──offer──► [Ringing] ──answer──► [Connecting] ──connected──► [Active]
  ▲                                     │                    │                      │             │
  │                                     ▼                    ▼                      ▼             ▼
  └──────────────────────────────── [Ended] ◄──────────────────────────────────────────────────────┘
                                       ▲
                                       │
                              [Error/Timeout/Reject]
```

## Components and Interfaces

### 1. Enhanced WebRTC Hook (`useWebRTC`)

**Key Improvements:**
- Proper peer connection lifecycle management
- Robust ICE candidate handling with queuing
- Connection state monitoring and recovery
- Media stream error handling
- Automatic quality adaptation

**Interface:**
```typescript
interface WebRTCHook {
  callState: CallState;
  connectionQuality: ConnectionQuality;
  startCall: (recipientId: string, recipientName: string, callType: CallType) => Promise<void>;
  answerCall: () => Promise<void>;
  rejectCall: () => void;
  endCall: () => void;
  toggleMute: () => void;
  toggleVideo: () => void;
  // New methods
  retryConnection: () => Promise<void>;
  switchToAudioOnly: () => Promise<void>;
}
```

### 2. Call State Manager

**Enhanced State Management:**
```typescript
interface CallState {
  callId: string | null;
  status: 'idle' | 'initiating' | 'ringing' | 'connecting' | 'connected' | 'ended' | 'error';
  callType: 'audio' | 'video' | null;
  participants: {
    local: UserInfo;
    remote: UserInfo;
  };
  connection: {
    quality: 'excellent' | 'good' | 'poor' | 'unknown';
    isReconnecting: boolean;
    lastError: string | null;
  };
  media: {
    localStream: MediaStream | null;
    remoteStream: MediaStream | null;
    isMuted: boolean;
    isVideoEnabled: boolean;
  };
  timing: {
    startTime: Date | null;
    connectTime: Date | null;
    duration: number;
  };
}
```

### 3. Media Stream Manager

**Responsibilities:**
- Device permission handling
- Stream quality management
- Adaptive bitrate control
- Error recovery for media devices

**Interface:**
```typescript
interface MediaManager {
  getMediaStream: (constraints: MediaConstraints) => Promise<MediaStream>;
  handleDeviceChange: () => void;
  adaptQuality: (quality: QualityLevel) => Promise<void>;
  switchCamera: () => Promise<void>;
  handleMediaError: (error: MediaError) => Promise<void>;
}
```

### 4. Connection Manager

**Enhanced Connection Handling:**
- Multiple STUN/TURN server fallback
- ICE candidate queuing and batch processing
- Connection quality monitoring
- Automatic reconnection logic

**Configuration:**
```typescript
const rtcConfig = {
  iceServers: [
    // Primary STUN servers
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    // Backup STUN servers
    { urls: 'stun:stun.stunprotocol.org:3478' },
    // TURN servers with authentication
    {
      urls: ['turn:openrelay.metered.ca:80', 'turn:openrelay.metered.ca:443'],
      username: 'openrelayproject',
      credential: 'openrelayproject'
    }
  ],
  iceCandidatePoolSize: 10,
  bundlePolicy: 'max-bundle',
  rtcpMuxPolicy: 'require'
};
```

## Data Models

### Call Record
```typescript
interface CallRecord {
  callId: string;
  participants: {
    caller: string;
    callee: string;
  };
  type: 'audio' | 'video';
  status: CallStatus;
  timestamps: {
    initiated: Date;
    answered?: Date;
    ended?: Date;
  };
  metadata: {
    duration?: number;
    endReason?: 'normal' | 'error' | 'timeout' | 'rejected';
    quality?: ConnectionQuality;
  };
}
```

### ICE Candidate Queue
```typescript
interface ICECandidateQueue {
  callId: string;
  candidates: RTCIceCandidate[];
  isProcessing: boolean;
  addCandidate: (candidate: RTCIceCandidate) => void;
  processQueue: () => Promise<void>;
}
```

## Error Handling

### Error Categories and Recovery Strategies

1. **Media Access Errors**
   - Permission denied → Show permission guide
   - Device not found → Fallback to available devices
   - Device busy → Retry with different constraints

2. **WebRTC Connection Errors**
   - ICE connection failed → Retry with TURN servers
   - Peer connection failed → Reinitialize connection
   - Signaling errors → Retry socket connection

3. **Network Errors**
   - Socket disconnection → Automatic reconnection
   - High latency → Quality degradation
   - Packet loss → Adaptive bitrate

4. **Browser Compatibility**
   - WebRTC not supported → Show upgrade message
   - Codec issues → Fallback codecs
   - Security restrictions → HTTPS requirement

### Error Recovery Flow
```
Error Detected → Classify Error → Apply Recovery Strategy → Retry → Success/Failure
                                                              │
                                                              ▼
                                                        Escalate to User
```

## Testing Strategy

### Unit Tests
- WebRTC hook state transitions
- Media stream management
- Error handling functions
- Socket event handlers

### Integration Tests
- End-to-end call flow
- Error recovery scenarios
- Network condition simulation
- Device permission handling

### Manual Testing Scenarios
1. **Basic Call Flow**
   - Audio call initiation and acceptance
   - Video call initiation and acceptance
   - Call rejection and timeout

2. **Error Scenarios**
   - Network disconnection during call
   - Media device errors
   - Browser compatibility issues

3. **Edge Cases**
   - Multiple simultaneous calls
   - Call while already in call
   - Rapid call/hangup sequences

### Performance Testing
- Connection establishment time
- Audio/video quality metrics
- Memory usage during calls
- Battery impact on mobile devices

## Security Considerations

### Media Privacy
- Secure media stream handling
- Proper stream cleanup on call end
- No unauthorized recording capabilities

### Network Security
- DTLS encryption for media streams
- Secure signaling over WSS
- ICE candidate validation

### User Privacy
- No call content logging
- Secure user identification
- Permission-based media access

## Implementation Phases

### Phase 1: Core Fixes
- Fix WebRTC connection initialization
- Implement proper ICE candidate handling
- Add comprehensive error logging
- Fix call state management

### Phase 2: Enhanced Features
- Connection quality monitoring
- Automatic quality adaptation
- Improved error recovery
- Better user feedback

### Phase 3: Advanced Features
- Call recording (if required)
- Screen sharing capabilities
- Group calling support
- Advanced network diagnostics