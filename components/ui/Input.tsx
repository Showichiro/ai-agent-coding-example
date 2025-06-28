'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  valid?: boolean;
  size?: 'sm' | 'md' | 'lg';
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  multiline?: boolean;
  showCharCount?: boolean;
  showPasswordToggle?: boolean;
}

const EyeIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const EyeOffIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
  </svg>
);

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className,
    type = 'text',
    label,
    helperText,
    error,
    valid,
    size = 'md',
    startIcon,
    endIcon,
    multiline = false,
    showCharCount = false,
    showPasswordToggle = false,
    maxLength,
    value,
    required,
    id,
    ...props 
  }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const [inputValue, setInputValue] = React.useState(value || '');
    const generatedId = React.useId();
    const inputId = id || generatedId;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    React.useEffect(() => {
      setInputValue(value || '');
    }, [value]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setInputValue(e.target.value);
      props.onChange?.(e as React.ChangeEvent<HTMLInputElement>);
    };

    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
    };

    const getCharCountColor = () => {
      if (!maxLength) return 'text-gray-500';
      const length = String(inputValue).length;
      const ratio = length / maxLength;
      
      if (ratio > 1) return 'text-red-600';
      if (ratio > 0.8) return 'text-yellow-600';
      return 'text-gray-500';
    };

    const inputType = type === 'password' && showPasswordToggle && showPassword ? 'text' : type;
    
    const hasStartIcon = !!startIcon;
    const hasEndIcon = !!endIcon || (type === 'password' && showPasswordToggle) || showCharCount;

    const Component = multiline ? 'textarea' : 'input';

    const inputElement = (
      <Component
        id={inputId}
        ref={ref as React.Ref<HTMLInputElement & HTMLTextAreaElement>}
        type={multiline ? undefined : inputType}
        className={cn(
          // Base styles
          'block w-full border rounded-md shadow-sm transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-offset-0',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50',
          'placeholder:text-gray-400',
          
          // Size variants
          {
            'h-8 px-2 text-sm': size === 'sm',
            'h-10 px-3': size === 'md',
            'h-12 px-4 text-lg': size === 'lg',
          },
          
          // Icon spacing
          {
            'pl-10': hasStartIcon && size === 'md',
            'pl-8': hasStartIcon && size === 'sm',
            'pl-12': hasStartIcon && size === 'lg',
            'pr-10': hasEndIcon && size === 'md',
            'pr-8': hasEndIcon && size === 'sm',
            'pr-12': hasEndIcon && size === 'lg',
          },
          
          // Multiline specific
          {
            'min-h-[80px] py-2 resize-vertical': multiline,
          },
          
          // Validation states
          {
            'border-gray-300 focus:ring-blue-500 focus:border-blue-500': !error && !valid,
            'border-red-500 focus:ring-red-500 focus:border-red-500': error,
            'border-green-500 focus:ring-green-500 focus:border-green-500': valid && !error,
          },
          
          className
        )}
        value={inputValue}
        onChange={handleInputChange}
        aria-invalid={!!error}
        aria-describedby={cn(
          error && errorId,
          helperText && helperId,
        )}
        maxLength={maxLength}
        required={required}
        {...props}
      />
    );

    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        <div className="relative">
          {inputElement}
          
          {/* Start Icon */}
          {startIcon && (
            <div className={cn(
              'absolute left-0 top-0 flex items-center pointer-events-none text-gray-400',
              {
                'h-8 pl-2': size === 'sm',
                'h-10 pl-3': size === 'md',
                'h-12 pl-4': size === 'lg',
              }
            )}>
              {startIcon}
            </div>
          )}
          
          {/* End Icons */}
          {(endIcon || (type === 'password' && showPasswordToggle)) && (
            <div className={cn(
              'absolute right-0 top-0 flex items-center',
              {
                'h-8 pr-2': size === 'sm',
                'h-10 pr-3': size === 'md',
                'h-12 pr-4': size === 'lg',
              }
            )}>
              {type === 'password' && showPasswordToggle && (
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              )}
              {endIcon && <span className="text-gray-400">{endIcon}</span>}
            </div>
          )}
        </div>
        
        {/* Helper Text or Error */}
        {(helperText || error) && (
          <div className="mt-1">
            {error ? (
              <p id={errorId} className="text-sm text-red-500">
                {error}
              </p>
            ) : helperText ? (
              <p id={helperId} className="text-sm text-gray-500">
                {helperText}
              </p>
            ) : null}
          </div>
        )}
        
        {/* Character Count */}
        {showCharCount && maxLength && (
          <div className="mt-1 text-right">
            <span className={cn('text-xs', getCharCountColor())}>
              {String(inputValue).length}/{maxLength}
            </span>
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };