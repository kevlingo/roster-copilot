import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import Toast from './Toast';

describe('Toast Component', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  it('should render success toast with correct styling', () => {
    render(
      <Toast
        id="test-1"
        type="success"
        message="Success message"
        onClose={mockOnClose}
      />
    );

    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('alert-success');
    expect(screen.getByText('Success message')).toBeInTheDocument();
  });

  it('should render error toast with correct styling', () => {
    render(
      <Toast
        id="test-2"
        type="error"
        message="Error message"
        onClose={mockOnClose}
      />
    );

    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('alert-error');
    expect(screen.getByText('Error message')).toBeInTheDocument();
  });

  it('should render info toast with correct styling', () => {
    render(
      <Toast
        id="test-3"
        type="info"
        message="Info message"
        onClose={mockOnClose}
      />
    );

    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('alert-info');
    expect(screen.getByText('Info message')).toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', () => {
    render(
      <Toast
        id="test-4"
        type="success"
        message="Test message"
        onClose={mockOnClose}
      />
    );

    const closeButton = screen.getByLabelText('Close notification');
    fireEvent.click(closeButton);

    // Should trigger the close animation, then call onClose after delay
    act(() => {
      jest.advanceTimersByTime(300);
    });
    expect(mockOnClose).toHaveBeenCalledWith('test-4');
  });

  it('should auto-dismiss after specified duration', () => {
    render(
      <Toast
        id="test-5"
        type="success"
        message="Auto dismiss test"
        duration={3000}
        onClose={mockOnClose}
      />
    );

    // Fast-forward time by the duration
    act(() => {
      jest.advanceTimersByTime(3000);
    });

    // Should trigger close animation, then call onClose after animation delay
    act(() => {
      jest.advanceTimersByTime(300);
    });
    expect(mockOnClose).toHaveBeenCalledWith('test-5');
  });

  it('should use default duration when not specified', () => {
    render(
      <Toast
        id="test-6"
        type="success"
        message="Default duration test"
        onClose={mockOnClose}
      />
    );

    // Fast-forward by default duration (5000ms)
    act(() => {
      jest.advanceTimersByTime(5000);
    });
    act(() => {
      jest.advanceTimersByTime(300);
    });
    expect(mockOnClose).toHaveBeenCalledWith('test-6');
  });
});
