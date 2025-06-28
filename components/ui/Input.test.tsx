import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Input } from './Input';

describe('Input Component', () => {
  describe('Rendering', () => {
    it('renders input element', () => {
      render(<Input placeholder="Enter text" />);
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('renders with label when provided', () => {
      render(<Input label="Username" />);
      expect(screen.getByLabelText('Username')).toBeInTheDocument();
      expect(screen.getByText('Username')).toBeInTheDocument();
    });

    it('renders with helper text when provided', () => {
      render(<Input helperText="Enter your username" />);
      expect(screen.getByText('Enter your username')).toBeInTheDocument();
    });

    it('renders as textarea when multiline is true', () => {
      render(<Input multiline />);
      expect(screen.getByRole('textbox')).toBeInTheDocument();
      expect(screen.getByRole('textbox').tagName).toBe('TEXTAREA');
    });
  });

  describe('Input Types', () => {
    it('renders email input type', () => {
      render(<Input type="email" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'email');
    });

    it('renders password input type', () => {
      render(<Input type="password" />);
      const input = screen.getByDisplayValue('');
      expect(input).toHaveAttribute('type', 'password');
    });

    it('renders number input type', () => {
      render(<Input type="number" />);
      const input = screen.getByRole('spinbutton');
      expect(input).toHaveAttribute('type', 'number');
    });

    it('renders search input with icon', () => {
      render(<Input type="search" />);
      const input = screen.getByRole('searchbox');
      expect(input).toHaveAttribute('type', 'search');
    });
  });

  describe('Validation States', () => {
    it('applies error styles when error prop is provided', () => {
      render(<Input error="This field is required" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('border-red-500');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('displays error message', () => {
      render(<Input error="Invalid email format" />);
      expect(screen.getByText('Invalid email format')).toBeInTheDocument();
      expect(screen.getByText('Invalid email format')).toHaveClass('text-red-500');
    });

    it('applies success styles when valid prop is true', () => {
      render(<Input valid />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('border-green-500');
    });

    it('shows required indicator when required', () => {
      render(<Input label="Email" required />);
      expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('sets aria-describedby for error message', () => {
      render(<Input error="Error message" />);
      const input = screen.getByRole('textbox');
      const errorId = input.getAttribute('aria-describedby');
      expect(errorId).toBeTruthy();
      expect(screen.getByText('Error message')).toHaveAttribute('id', errorId);
    });
  });

  describe('Sizes', () => {
    it('applies small size styles', () => {
      render(<Input size="sm" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('h-8', 'px-2', 'text-sm');
    });

    it('applies medium size styles (default)', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('h-10', 'px-3');
    });

    it('applies large size styles', () => {
      render(<Input size="lg" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('h-12', 'px-4', 'text-lg');
    });
  });

  describe('Icons and Adornments', () => {
    it('renders start icon', () => {
      render(<Input startIcon="🔍" />);
      expect(screen.getByText('🔍')).toBeInTheDocument();
    });

    it('renders end icon', () => {
      render(<Input endIcon="📧" />);
      expect(screen.getByText('📧')).toBeInTheDocument();
    });

    it('renders both start and end icons', () => {
      render(<Input startIcon="🔍" endIcon="✕" />);
      expect(screen.getByText('🔍')).toBeInTheDocument();
      expect(screen.getByText('✕')).toBeInTheDocument();
    });

    it('adjusts padding when icons are present', () => {
      render(<Input startIcon="🔍" endIcon="✕" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('pl-10', 'pr-10');
    });
  });

  describe('Interactions', () => {
    it('calls onChange handler when value changes', () => {
      const handleChange = vi.fn();
      render(<Input onChange={handleChange} />);
      
      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'test' } });
      
      expect(handleChange).toHaveBeenCalledTimes(1);
      expect(handleChange).toHaveBeenCalledWith(expect.any(Object));
    });

    it('calls onFocus handler when focused', () => {
      const handleFocus = vi.fn();
      render(<Input onFocus={handleFocus} />);
      
      fireEvent.focus(screen.getByRole('textbox'));
      expect(handleFocus).toHaveBeenCalledTimes(1);
    });

    it('calls onBlur handler when blurred', () => {
      const handleBlur = vi.fn();
      render(<Input onBlur={handleBlur} />);
      
      const input = screen.getByRole('textbox');
      fireEvent.focus(input);
      fireEvent.blur(input);
      
      expect(handleBlur).toHaveBeenCalledTimes(1);
    });

    it('handles keyboard events', () => {
      const handleKeyDown = vi.fn();
      render(<Input onKeyDown={handleKeyDown} />);
      
      fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter' });
      expect(handleKeyDown).toHaveBeenCalledTimes(1);
    });
  });

  describe('States', () => {
    it('is disabled when disabled prop is true', () => {
      render(<Input disabled />);
      const input = screen.getByRole('textbox');
      expect(input).toBeDisabled();
      expect(input).toHaveClass('disabled:opacity-50', 'disabled:cursor-not-allowed');
    });

    it('is readonly when readonly prop is true', () => {
      render(<Input readOnly />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('readonly');
    });

    it('applies focus styles when focused', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      fireEvent.focus(input);
      expect(input).toHaveClass('focus:ring-2', 'focus:ring-blue-500');
    });
  });

  describe('Accessibility', () => {
    it('has proper focus management', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('focus:outline-none', 'focus:ring-2');
    });

    it('associates label with input using htmlFor', () => {
      render(<Input label="Username" />);
      const label = screen.getByText('Username');
      const input = screen.getByRole('textbox');
      
      expect(label).toHaveAttribute('for', input.getAttribute('id'));
    });

    it('supports aria-label', () => {
      render(<Input aria-label="Search products" />);
      expect(screen.getByLabelText('Search products')).toBeInTheDocument();
    });

    it('supports aria-describedby for helper text', () => {
      render(<Input helperText="Enter at least 8 characters" />);
      const input = screen.getByRole('textbox');
      const helperId = input.getAttribute('aria-describedby');
      expect(helperId).toBeTruthy();
      expect(screen.getByText('Enter at least 8 characters')).toHaveAttribute('id', helperId);
    });

    it('announces validation errors to screen readers', () => {
      render(<Input error="Invalid input" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-invalid', 'true');
      expect(input).toHaveAttribute('aria-describedby');
    });
  });

  describe('Password Input Features', () => {
    it('renders password visibility toggle', () => {
      render(<Input type="password" showPasswordToggle />);
      expect(screen.getByRole('button', { name: /show password/i })).toBeInTheDocument();
    });

    it('toggles password visibility when toggle is clicked', () => {
      render(<Input type="password" showPasswordToggle />);
      const input = screen.getByDisplayValue('');
      const toggleButton = screen.getByRole('button', { name: /show password/i });
      
      expect(input).toHaveAttribute('type', 'password');
      
      fireEvent.click(toggleButton);
      expect(input).toHaveAttribute('type', 'text');
      expect(screen.getByRole('button', { name: /hide password/i })).toBeInTheDocument();
    });
  });

  describe('Custom styling', () => {
    it('accepts custom className', () => {
      render(<Input className="custom-input" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('custom-input');
    });

    it('merges custom className with default classes', () => {
      render(<Input className="custom-input" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('custom-input', 'border', 'rounded-md');
    });
  });

  describe('Character Count', () => {
    it('shows character count when maxLength is provided', () => {
      render(<Input maxLength={100} showCharCount />);
      expect(screen.getByText('0/100')).toBeInTheDocument();
    });

    it('updates character count as user types', () => {
      render(<Input maxLength={10} showCharCount />);
      const input = screen.getByRole('textbox');
      
      fireEvent.change(input, { target: { value: 'hello' } });
      expect(screen.getByText('5/10')).toBeInTheDocument();
    });

    it('shows warning when approaching character limit', () => {
      render(<Input maxLength={10} showCharCount />);
      const input = screen.getByRole('textbox');
      
      fireEvent.change(input, { target: { value: 'hello wor' } });
      const charCount = screen.getByText('9/10');
      expect(charCount).toHaveClass('text-yellow-600');
    });

    it('shows error when character limit is exceeded', () => {
      render(<Input maxLength={5} showCharCount />);
      const input = screen.getByRole('textbox');
      
      fireEvent.change(input, { target: { value: 'hello world' } });
      const charCount = screen.getByText('11/5');
      expect(charCount).toHaveClass('text-red-600');
    });
  });
});