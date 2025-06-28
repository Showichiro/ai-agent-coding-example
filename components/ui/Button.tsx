'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  loading?: boolean;
  asChild?: boolean;
}

const LoadingSpinner = () => (
  <svg
    data-testid="loading-spinner"
    className="animate-spin -ml-1 mr-2 h-4 w-4"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    ></circle>
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    ></path>
  </svg>
);

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant = 'default', 
    size = 'md', 
    loading = false,
    asChild = false,
    children,
    disabled,
    onClick,
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : 'button';
    
    const isDisabled = disabled || loading;

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (isDisabled) {
        event.preventDefault();
        return;
      }
      onClick?.(event);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
      if (isDisabled) {
        event.preventDefault();
        return;
      }
      
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onClick?.(event as React.MouseEvent<HTMLButtonElement>);
      }
    };

    if (asChild) {
      return (
        <Comp
          ref={ref}
          {...props}
        >
          {React.cloneElement(children as React.ReactElement, {
            className: cn(
              // Base styles
              'inline-flex items-center justify-center rounded-md font-medium transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
              'disabled:pointer-events-none disabled:opacity-50',
              
              // Variant styles
              {
                'bg-gray-100 text-gray-900 hover:bg-gray-200 focus-visible:ring-gray-400': variant === 'default',
                'bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500': variant === 'primary',
                'border border-gray-300 bg-transparent hover:bg-gray-50 focus-visible:ring-gray-400': variant === 'outline',
                'hover:bg-gray-100 focus-visible:ring-gray-400': variant === 'ghost',
                'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500': variant === 'destructive',
              },
              
              // Size styles
              {
                'h-8 px-3 text-sm': size === 'sm',
                'h-10 px-4': size === 'md',
                'h-12 px-6 text-lg': size === 'lg',
                'h-10 w-10': size === 'icon',
              },
              
              className,
              (children as React.ReactElement).props.className
            ),
            disabled: isDisabled,
            onClick: handleClick,
            onKeyDown: handleKeyDown,
            'aria-busy': loading,
          })}
        </Comp>
      );
    }

    return (
      <Comp
        className={cn(
          // Base styles
          'inline-flex items-center justify-center rounded-md font-medium transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50',
          
          // Variant styles
          {
            'bg-gray-100 text-gray-900 hover:bg-gray-200 focus-visible:ring-gray-400': variant === 'default',
            'bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500': variant === 'primary',
            'border border-gray-300 bg-transparent hover:bg-gray-50 focus-visible:ring-gray-400': variant === 'outline',
            'hover:bg-gray-100 focus-visible:ring-gray-400': variant === 'ghost',
            'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500': variant === 'destructive',
          },
          
          // Size styles
          {
            'h-8 px-3 text-sm': size === 'sm',
            'h-10 px-4': size === 'md',
            'h-12 px-6 text-lg': size === 'lg',
            'h-10 w-10': size === 'icon',
          },
          
          className
        )}
        ref={ref}
        disabled={isDisabled}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        aria-busy={loading}
        {...props}
      >
        {loading && <LoadingSpinner />}
        {children}
      </Comp>
    );
  }
);

Button.displayName = 'Button';

export { Button };