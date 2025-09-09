import { 
  CallErrorHandler, 
  createUserFriendlyError, 
  handleErrorWithRetry 
} from '../callErrorHandler';

describe('CallErrorHandler', () => {
  describe('Error Classification', () => {
    it('should classify permission denied errors', () => {
      const error = new Error('Permission denied');
      error.name = 'NotAllowedError';
      
      const result = CallErrorHandler.classifyError(error);
      
      expect(result.type).toBe('permission');
      expect(result.code).toBe('PERMISSION_DENIED');
      expect(result.recoverable).toBe(true);
      expect(result.userMessage).toBe('Camera and microphone access denied');
      expect(result.suggestions).toContain('Allow access to camera and microphone');
    });

    it('should classify device not found errors', () => {
      const error = new Error('NotFoundError: Device not found');
      
      const result = CallErrorHandler.classifyError(error);
      
      expect(result.type).toBe('device');
      expect(result.code).toBe('DEVICE_NOT_FOUND');
      expect(result.recoverable).toBe(true);
      expect(result.userMessage).toBe('Camera or microphone not found');
    });

    it('should classify device in use errors', () => {
      const error = new Error('NotReadableError: Device in use');
      
      const result = CallErrorHandler.classifyError(error);
      
      expect(result.type).toBe('device');
      expect(result.code).toBe('DEVICE_IN_USE');
      expect(result.recoverable).toBe(true);
      expect(result.userMessage).toBe('Camera or microphone is already in use');
    });

    it('should classify constraint errors', () => {
      const error = new Error('OverconstrainedError: Constraints not satisfied');
      
      const result = CallErrorHandler.classifyError(error);
      
      expect(result.type).toBe('media');
      expect(result.code).toBe('CONSTRAINTS_NOT_SATISFIED');
      expect(result.recoverable).toBe(true);
    });

    it('should classify WebRTC connection errors', () => {
      const error = new Error('ICE connection failed');
      
      const result = CallErrorHandler.classifyError(error);
      
      expect(result.type).toBe('webrtc');
      expect(result.code).toBe('ICE_CONNECTION_FAILED');
      expect(result.recoverable).toBe(true);
    });

    it('should classify network errors', () => {
      const error = new Error('Socket not connected');
      
      const result = CallErrorHandler.classifyError(error);
      
      expect(result.type).toBe('network');
      expect(result.code).toBe('NETWORK_DISCONNECTED');
      expect(result.recoverable).toBe(true);
    });

    it('should classify browser compatibility errors', () => {
      const error = new Error('getUserMedia is not supported');
      
      const result = CallErrorHandler.classifyError(error);
      
      expect(result.type).toBe('browser');
      expect(result.code).toBe('BROWSER_NOT_SUPPORTED');
      expect(result.recoverable).toBe(false);
    });

    it('should handle unknown errors', () => {
      const error = new Error('Some unknown error');
      
      const result = CallErrorHandler.classifyError(error);
      
      expect(result.type).toBe('unknown');
      expect(result.code).toBe('UNKNOWN_ERROR');
      expect(result.recoverable).toBe(true);
      expect(result.userMessage).toBe('An unexpected error occurred');
    });
  });

  describe('Retry Logic', () => {
    it('should allow retries for network errors within limit', () => {
      const networkError = CallErrorHandler.classifyError(new Error('Connection failed'));
      
      expect(CallErrorHandler.shouldRetry(networkError, 0)).toBe(true);
      expect(CallErrorHandler.shouldRetry(networkError, 1)).toBe(true);
      expect(CallErrorHandler.shouldRetry(networkError, 2)).toBe(false);
      expect(CallErrorHandler.shouldRetry(networkError, 3)).toBe(false);
    });

    it('should not retry permission errors', () => {
      const permissionError = CallErrorHandler.classifyError(new Error('Permission denied'));
      
      expect(CallErrorHandler.shouldRetry(permissionError, 0)).toBe(false);
    });

    it('should not retry browser compatibility errors', () => {
      const browserError = CallErrorHandler.classifyError(new Error('getUserMedia is not supported'));
      
      expect(CallErrorHandler.shouldRetry(browserError, 0)).toBe(false);
    });

    it('should limit device error retries', () => {
      const deviceError = CallErrorHandler.classifyError(new Error('NotFoundError'));
      
      expect(CallErrorHandler.shouldRetry(deviceError, 0)).toBe(true);
      expect(CallErrorHandler.shouldRetry(deviceError, 1)).toBe(false);
    });

    it('should calculate correct retry delays', () => {
      expect(CallErrorHandler.getRetryDelay(0)).toBe(1000);
      expect(CallErrorHandler.getRetryDelay(1)).toBe(2000);
      expect(CallErrorHandler.getRetryDelay(2)).toBe(4000);
      expect(CallErrorHandler.getRetryDelay(3)).toBe(4000); // Capped at 4000ms
    });
  });

  describe('Recovery Actions', () => {
    it('should provide recovery action for permission errors', () => {
      const permissionError = CallErrorHandler.classifyError(new Error('Permission denied'));
      const recoveryAction = CallErrorHandler.getRecoveryAction(permissionError);
      
      expect(recoveryAction).toBeDefined();
      expect(typeof recoveryAction).toBe('function');
    });

    it('should provide recovery action for device errors', () => {
      const deviceError = CallErrorHandler.classifyError(new Error('NotFoundError'));
      const recoveryAction = CallErrorHandler.getRecoveryAction(deviceError);
      
      expect(recoveryAction).toBeDefined();
      expect(typeof recoveryAction).toBe('function');
    });

    it('should provide recovery action for network errors', () => {
      const networkError = CallErrorHandler.classifyError(new Error('Socket not connected'));
      const recoveryAction = CallErrorHandler.getRecoveryAction(networkError);
      
      expect(recoveryAction).toBeDefined();
      expect(typeof recoveryAction).toBe('function');
    });

    it('should return null for errors without recovery actions', () => {
      const unknownError = CallErrorHandler.classifyError(new Error('Unknown error'));
      const recoveryAction = CallErrorHandler.getRecoveryAction(unknownError);
      
      expect(recoveryAction).toBeNull();
    });
  });
});

describe('createUserFriendlyError', () => {
  it('should create user-friendly error with context', () => {
    const error = new Error('Permission denied');
    const context = 'Starting video call';
    
    const result = createUserFriendlyError(error, context);
    
    expect(result.userMessage).toBe('Starting video call: Camera and microphone access denied');
  });

  it('should handle string errors', () => {
    const error = 'Connection timeout';
    
    const result = createUserFriendlyError(error);
    
    expect(result.message).toBe('Connection timeout');
  });
});

describe('handleErrorWithRetry', () => {
  it('should succeed on first attempt', async () => {
    const operation = jest.fn().mockResolvedValue('success');
    
    const result = await handleErrorWithRetry(operation, 3);
    
    expect(result).toBe('success');
    expect(operation).toHaveBeenCalledTimes(1);
  });

  it('should retry on recoverable errors', async () => {
    const operation = jest.fn()
      .mockRejectedValueOnce(new Error('Connection failed'))
      .mockResolvedValueOnce('success');
    
    const result = await handleErrorWithRetry(operation, 3, 'Test operation');
    
    expect(result).toBe('success');
    expect(operation).toHaveBeenCalledTimes(2);
  });

  it('should not retry non-recoverable errors', async () => {
    const operation = jest.fn()
      .mockRejectedValue(new Error('Permission denied'));
    
    await expect(handleErrorWithRetry(operation, 3)).rejects.toThrow();
    expect(operation).toHaveBeenCalledTimes(1);
  });

  it('should stop retrying after max attempts', async () => {
    const operation = jest.fn()
      .mockRejectedValue(new Error('Connection failed'));
    
    await expect(handleErrorWithRetry(operation, 2)).rejects.toThrow();
    expect(operation).toHaveBeenCalledTimes(2);
  });
});