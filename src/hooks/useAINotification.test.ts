import { renderHook } from '@testing-library/react';
import { useAINotification, setGlobalNotificationHandler, createAINotificationMessage } from './useAINotification';

describe('useAINotification', () => {
  let mockHandler: jest.Mock;

  beforeEach(() => {
    mockHandler = jest.fn();
    setGlobalNotificationHandler(mockHandler);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('showSuccess calls global handler with success type', () => {
    const { result } = renderHook(() => useAINotification());
    
    result.current.showSuccess('Test success message');
    
    expect(mockHandler).toHaveBeenCalledWith('Test success message', 'success');
  });

  test('showError calls global handler with error type', () => {
    const { result } = renderHook(() => useAINotification());
    
    result.current.showError('Test error message');
    
    expect(mockHandler).toHaveBeenCalledWith('Test error message', 'error');
  });

  test('showInfo calls global handler with info type', () => {
    const { result } = renderHook(() => useAINotification());
    
    result.current.showInfo('Test info message');
    
    expect(mockHandler).toHaveBeenCalledWith('Test info message', 'info');
  });

  test('falls back to console when no handler is set', () => {
    setGlobalNotificationHandler(null);
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
    
    const { result } = renderHook(() => useAINotification());
    
    result.current.showSuccess('Test message');
    
    expect(consoleSpy).toHaveBeenCalledWith(
      'AI notification handler not available, falling back to console:',
      'Test message'
    );
    
    consoleSpy.mockRestore();
  });
});

describe('createAINotificationMessage', () => {
  test('creates success notification message', () => {
    const message = createAINotificationMessage('Operation completed', 'success');
    
    expect(message.sender).toBe('ai');
    expect(message.type).toBe('notification');
    expect(message.notificationType).toBe('success');
    expect(message.text).toContain('Operation completed');
    expect(message.text).toMatch(/Great news!|Excellent!|Perfect!|Wonderful!/);
    expect(message.id).toBeDefined();
    expect(message.timestamp).toBeInstanceOf(Date);
  });

  test('creates error notification message', () => {
    const message = createAINotificationMessage('Something went wrong', 'error');
    
    expect(message.sender).toBe('ai');
    expect(message.type).toBe('notification');
    expect(message.notificationType).toBe('error');
    expect(message.text).toContain('Something went wrong');
    expect(message.text).toMatch(/Oops!|Hmm,|Oh no!|I noticed/);
    expect(message.id).toBeDefined();
    expect(message.timestamp).toBeInstanceOf(Date);
  });

  test('creates info notification message', () => {
    const message = createAINotificationMessage('System update', 'info');
    
    expect(message.sender).toBe('ai');
    expect(message.type).toBe('notification');
    expect(message.notificationType).toBe('info');
    expect(message.text).toContain('System update');
    expect(message.text).toMatch(/Just so you know:|Here's an update:|FYI:|Quick heads up:/);
    expect(message.id).toBeDefined();
    expect(message.timestamp).toBeInstanceOf(Date);
  });
});
