import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ActiveCallModal } from '../ActiveCallModal';
import { CallState } from '../../../hooks/useWebRTC';

// Mock the UI components
jest.mock('../../ui/dialog', () => ({
  Dialog: ({ children }: { children: React.ReactNode }) => <div data-testid="dialog">{children}</div>,
  DialogContent: ({ children }: { children: React.ReactNode }) => <div data-testid="dialog-content">{children}</div>
}));

jest.mock('../../ui/button', () => ({
  Button: ({ children, onClick, disabled, title, variant }: any) => (
    <button 
      onClick={onClick} 
      disabled={disabled} 
      title={title}
      data-variant={variant}
      data-testid="button"
    >
      {children}
    </button>
  )
}));

jest.mock('../../ui/avatar', () => ({
  Avatar: ({ children }: { children: React.ReactNode }) => <div data-testid="avatar">{children}</div>,
  AvatarFallback: ({ children }: { children: React.ReactNode }) => <div data-testid="avatar-fallback">{children}</div>,
  AvatarImage: ({ src }: { src?: string }) => <img data-testid="avatar-image" src={src} alt="" />
}));

const mockCallState: CallState = {
  callId: 'test-call-id',
  isInCall: true,
  isIncoming: false,
  isOutgoing: true,
  callType: 'video',
  remoteUserId: 'user123',
  remoteUserName: 'John Doe',
  remoteUserAvatar: 'https://example.com/avatar.jpg',
  status: 'connected',
  connection: {
    quality: 'good',
    isReconnecting: false,
    lastError: null,
    errorDetails: null
  }
};

const defaultProps = {
  callState: mockCallState,
  localVideoRef: { current: null } as React.RefObject<HTMLVideoElement>,
  remoteVideoRef: { current: null } as React.RefObject<HTMLVideoElement>,
  isMuted: false,
  isVideoEnabled: true,
  onEndCall: jest.fn(),
  onToggleMute: jest.fn(),
  onToggleVideo: jest.fn(),
  onRetryConnection: jest.fn(),
  onSwitchToAudioOnly: jest.fn()
};

describe('ActiveCallModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render video call layout correctly', () => {
    render(<ActiveCallModal {...defaultProps} />);
    
    expect(screen.getByTestId('dialog')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Good')).toBeInTheDocument();
  });

  it('should render audio call layout for audio calls', () => {
    const audioCallState = {
      ...mockCallState,
      callType: 'audio' as const
    };
    
    render(<ActiveCallModal {...defaultProps} callState={audioCallState} />);
    
    expect(screen.getByTestId('avatar')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('should show call duration when connected', () => {
    render(<ActiveCallModal {...defaultProps} />);
    
    // Should show 00:00 initially
    expect(screen.getByText(/00:00/)).toBeInTheDocument();
  });

  it('should show connection status for different states', () => {
    const connectingState = {
      ...mockCallState,
      status: 'connecting' as const
    };
    
    render(<ActiveCallModal {...defaultProps} callState={connectingState} />);
    
    expect(screen.getByText('Connecting...')).toBeInTheDocument();
  });

  it('should show error state correctly', () => {
    const errorState = {
      ...mockCallState,
      status: 'error' as const,
      connection: {
        ...mockCallState.connection,
        lastError: 'Connection failed'
      }
    };
    
    render(<ActiveCallModal {...defaultProps} callState={errorState} />);
    
    expect(screen.getByText('Call Failed')).toBeInTheDocument();
    expect(screen.getByText('Connection failed')).toBeInTheDocument();
  });

  it('should handle mute button click', () => {
    render(<ActiveCallModal {...defaultProps} />);
    
    const muteButtons = screen.getAllByTestId('button').filter(btn => 
      btn.getAttribute('title')?.includes('microphone')
    );
    
    fireEvent.click(muteButtons[0]);
    expect(defaultProps.onToggleMute).toHaveBeenCalled();
  });

  it('should handle video toggle button click', () => {
    render(<ActiveCallModal {...defaultProps} />);
    
    const videoButtons = screen.getAllByTestId('button').filter(btn => 
      btn.getAttribute('title')?.includes('camera')
    );
    
    fireEvent.click(videoButtons[0]);
    expect(defaultProps.onToggleVideo).toHaveBeenCalled();
  });

  it('should handle end call button click', () => {
    render(<ActiveCallModal {...defaultProps} />);
    
    const endCallButtons = screen.getAllByTestId('button').filter(btn => 
      btn.getAttribute('data-variant') === 'destructive'
    );
    
    fireEvent.click(endCallButtons[0]);
    expect(defaultProps.onEndCall).toHaveBeenCalled();
  });

  it('should show retry button for poor connection', () => {
    const poorConnectionState = {
      ...mockCallState,
      connection: {
        ...mockCallState.connection,
        quality: 'poor' as const
      }
    };
    
    render(<ActiveCallModal {...defaultProps} callState={poorConnectionState} />);
    
    const retryButtons = screen.getAllByTestId('button').filter(btn => 
      btn.getAttribute('title')?.includes('retry') || 
      btn.textContent?.includes('Retry')
    );
    
    expect(retryButtons.length).toBeGreaterThan(0);
  });

  it('should show switch to audio-only button for poor video connection', () => {
    const poorVideoState = {
      ...mockCallState,
      callType: 'video' as const,
      connection: {
        ...mockCallState.connection,
        quality: 'poor' as const
      }
    };
    
    render(<ActiveCallModal {...defaultProps} callState={poorVideoState} />);
    
    expect(screen.getByText('Switch to Audio Only')).toBeInTheDocument();
  });

  it('should handle switch to audio-only button click', () => {
    const poorVideoState = {
      ...mockCallState,
      callType: 'video' as const,
      connection: {
        ...mockCallState.connection,
        quality: 'poor' as const
      }
    };
    
    render(<ActiveCallModal {...defaultProps} callState={poorVideoState} />);
    
    const switchButton = screen.getByText('Switch to Audio Only');
    fireEvent.click(switchButton);
    
    expect(defaultProps.onSwitchToAudioOnly).toHaveBeenCalled();
  });

  it('should show reconnecting status', () => {
    const reconnectingState = {
      ...mockCallState,
      connection: {
        ...mockCallState.connection,
        isReconnecting: true
      }
    };
    
    render(<ActiveCallModal {...defaultProps} callState={reconnectingState} />);
    
    expect(screen.getByText('Reconnecting...')).toBeInTheDocument();
  });

  it('should disable controls during error state', () => {
    const errorState = {
      ...mockCallState,
      status: 'error' as const
    };
    
    render(<ActiveCallModal {...defaultProps} callState={errorState} />);
    
    const buttons = screen.getAllByTestId('button');
    const controlButtons = buttons.filter(btn => 
      btn.getAttribute('title')?.includes('microphone') || 
      btn.getAttribute('title')?.includes('camera')
    );
    
    controlButtons.forEach(button => {
      expect(button).toBeDisabled();
    });
  });

  it('should show muted state correctly', () => {
    render(<ActiveCallModal {...defaultProps} isMuted={true} />);
    
    const muteButtons = screen.getAllByTestId('button').filter(btn => 
      btn.getAttribute('title')?.includes('microphone')
    );
    
    expect(muteButtons[0]).toHaveAttribute('data-variant', 'destructive');
  });

  it('should show video disabled state correctly', () => {
    render(<ActiveCallModal {...defaultProps} isVideoEnabled={false} />);
    
    const videoButtons = screen.getAllByTestId('button').filter(btn => 
      btn.getAttribute('title')?.includes('camera')
    );
    
    expect(videoButtons[0]).toHaveAttribute('data-variant', 'destructive');
  });
});