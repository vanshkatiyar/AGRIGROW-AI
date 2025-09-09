// Comprehensive error handling for WebRTC calls

export interface CallError {
  type: 'media' | 'webrtc' | 'network' | 'browser' | 'permission' | 'device' | 'unknown';
  code: string;
  message: string;
  userMessage: string;
  recoverable: boolean;
  suggestions: string[];
}

export class CallErrorHandler {
  static classifyError(error: Error | string): CallError {
    const errorMessage = typeof error === 'string' ? error : error.message;
    const errorName = error instanceof Error ? error.name : '';

    // Media Access Errors
    if (errorMessage.includes('Permission denied') || errorName === 'NotAllowedError') {
      return {
        type: 'permission',
        code: 'PERMISSION_DENIED',
        message: errorMessage,
        userMessage: 'Camera and microphone access denied',
        recoverable: true,
        suggestions: [
          'Click the camera/microphone icon in your browser address bar',
          'Allow access to camera and microphone',
          'Refresh the page and try again'
        ]
      };
    }

    if (errorMessage.includes('NotFoundError') || errorMessage.includes('DeviceNotFoundError')) {
      return {
        type: 'device',
        code: 'DEVICE_NOT_FOUND',
        message: errorMessage,
        userMessage: 'Camera or microphone not found',
        recoverable: true,
        suggestions: [
          'Check that your camera and microphone are connected',
          'Try using a different device',
          'Restart your browser and try again'
        ]
      };
    }

    if (errorMessage.includes('NotReadableError') || errorMessage.includes('TrackStartError')) {
      return {
        type: 'device',
        code: 'DEVICE_IN_USE',
        message: errorMessage,
        userMessage: 'Camera or microphone is already in use',
        recoverable: true,
        suggestions: [
          'Close other applications using your camera/microphone',
          'Restart your browser',
          'Try again in a few moments'
        ]
      };
    }

    if (errorMessage.includes('OverconstrainedError') || errorMessage.includes('ConstraintNotSatisfiedError')) {
      return {
        type: 'media',
        code: 'CONSTRAINTS_NOT_SATISFIED',
        message: errorMessage,
        userMessage: 'Camera or microphone settings not supported',
        recoverable: true,
        suggestions: [
          'Try switching to audio-only mode',
          'Use a different camera or microphone',
          'Update your browser to the latest version'
        ]
      };
    }

    // WebRTC Connection Errors
    if (errorMessage.includes('ICE connection failed') || errorMessage.includes('connection failed')) {
      return {
        type: 'webrtc',
        code: 'ICE_CONNECTION_FAILED',
        message: errorMessage,
        userMessage: 'Connection failed',
        recoverable: true,
        suggestions: [
          'Check your internet connection',
          'Try again in a few moments',
          'Switch to a different network if possible'
        ]
      };
    }

    if (errorMessage.includes('Peer connection failed')) {
      return {
        type: 'webrtc',
        code: 'PEER_CONNECTION_FAILED',
        message: errorMessage,
        userMessage: 'Failed to establish connection',
        recoverable: true,
        suggestions: [
          'Refresh the page and try again',
          'Check your firewall settings',
          'Try using a different browser'
        ]
      };
    }

    // Network Errors
    if (errorMessage.includes('Socket not connected') || errorMessage.includes('Connection lost')) {
      return {
        type: 'network',
        code: 'NETWORK_DISCONNECTED',
        message: errorMessage,
        userMessage: 'Network connection lost',
        recoverable: true,
        suggestions: [
          'Check your internet connection',
          'Refresh the page',
          'Try again when your connection is stable'
        ]
      };
    }

    // Browser Compatibility Errors
    if (errorMessage.includes('getUserMedia is not supported') || errorMessage.includes('WebRTC not supported')) {
      return {
        type: 'browser',
        code: 'BROWSER_NOT_SUPPORTED',
        message: errorMessage,
        userMessage: 'Your browser does not support video calls',
        recoverable: false,
        suggestions: [
          'Use a modern browser like Chrome, Firefox, or Safari',
          'Update your browser to the latest version',
          'Enable WebRTC in your browser settings'
        ]
      };
    }

    // Timeout Errors
    if (errorMessage.includes('timed out') || errorMessage.includes('timeout')) {
      return {
        type: 'network',
        code: 'CALL_TIMEOUT',
        message: errorMessage,
        userMessage: 'Call timed out',
        recoverable: true,
        suggestions: [
          'The other person may not be available',
          'Try calling again',
          'Check your internet connection'
        ]
      };
    }

    // Generic/Unknown Errors
    return {
      type: 'unknown',
      code: 'UNKNOWN_ERROR',
      message: errorMessage,
      userMessage: 'An unexpected error occurred',
      recoverable: true,
      suggestions: [
        'Refresh the page and try again',
        'Check your internet connection',
        'Contact support if the problem persists'
      ]
    };
  }

  static getRecoveryAction(error: CallError): (() => void) | null {
    switch (error.code) {
      case 'PERMISSION_DENIED':
        return () => {
          // Guide user to enable permissions
          window.open('https://support.google.com/chrome/answer/2693767', '_blank');
        };
      
      case 'DEVICE_NOT_FOUND':
      case 'DEVICE_IN_USE':
        return () => {
          // Attempt to re-enumerate devices
          if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
            navigator.mediaDevices.enumerateDevices()
              .then(devices => {
                console.log('Available devices:', devices);
              })
              .catch(console.error);
          }
        };
      
      case 'NETWORK_DISCONNECTED':
        return () => {
          // Attempt to reconnect
          window.location.reload();
        };
      
      default:
        return null;
    }
  }

  static logError(error: CallError, context?: Record<string, any>): void {
    const logData = {
      timestamp: new Date().toISOString(),
      error: {
        type: error.type,
        code: error.code,
        message: error.message,
        recoverable: error.recoverable
      },
      context: context || {},
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    console.error('Call Error:', logData);

    // In a production environment, you might want to send this to a logging service
    // Example: sendToLoggingService(logData);
  }

  static shouldRetry(error: CallError, attemptCount: number): boolean {
    if (!error.recoverable || attemptCount >= 3) {
      return false;
    }

    // Don't retry permission or browser compatibility errors
    if (error.type === 'permission' || error.type === 'browser') {
      return false;
    }

    // Retry network and WebRTC errors with exponential backoff
    if (error.type === 'network' || error.type === 'webrtc') {
      return attemptCount < 2;
    }

    // Retry device errors once
    if (error.type === 'device') {
      return attemptCount < 1;
    }

    return false;
  }

  static getRetryDelay(attemptCount: number): number {
    // Exponential backoff: 1s, 2s, 4s
    return Math.min(1000 * Math.pow(2, attemptCount), 4000);
  }
}

// Helper function to create user-friendly error messages
export function createUserFriendlyError(error: Error | string, context?: string): CallError {
  const callError = CallErrorHandler.classifyError(error);
  
  // Add context to the user message if provided
  if (context) {
    callError.userMessage = `${context}: ${callError.userMessage}`;
  }

  // Log the error for debugging
  CallErrorHandler.logError(callError, { context });

  return callError;
}

// Helper function to handle errors with automatic retry logic
export async function handleErrorWithRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  context?: string
): Promise<T> {
  let lastError: CallError | null = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      const callError = createUserFriendlyError(error as Error, context);
      lastError = callError;

      if (!CallErrorHandler.shouldRetry(callError, attempt)) {
        throw callError;
      }

      // Wait before retrying
      const delay = CallErrorHandler.getRetryDelay(attempt);
      console.log(`Retrying operation in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}