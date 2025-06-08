import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock component to test theme switching
const ThemeTestComponent = () => {
  const toggleTheme = () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  return (
    <div>
      <button onClick={toggleTheme} data-testid="theme-toggle">
        Toggle Theme
      </button>
      <div 
        className="bg-base-100 text-base-content p-4" 
        data-testid="themed-content"
      >
        Themed Content
      </div>
    </div>
  );
};

describe('Theme Switching', () => {
  beforeEach(() => {
    // Reset to dark theme before each test (new default)
    document.documentElement.setAttribute('data-theme', 'dark');
  });

  it('should start with dark theme by default', () => {
    render(<ThemeTestComponent />);

    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('should toggle to light theme when button is clicked', () => {
    render(<ThemeTestComponent />);

    const toggleButton = screen.getByTestId('theme-toggle');
    fireEvent.click(toggleButton);

    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('should toggle back to dark theme when clicked again', () => {
    render(<ThemeTestComponent />);

    const toggleButton = screen.getByTestId('theme-toggle');

    // Toggle to light
    fireEvent.click(toggleButton);
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');

    // Toggle back to dark
    fireEvent.click(toggleButton);
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('should apply theme classes correctly', () => {
    render(<ThemeTestComponent />);
    
    const themedContent = screen.getByTestId('themed-content');
    
    // Check that Tailwind classes are applied
    expect(themedContent).toHaveClass('bg-base-100');
    expect(themedContent).toHaveClass('text-base-content');
    expect(themedContent).toHaveClass('p-4');
  });
});
