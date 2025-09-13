import React, { forwardRef } from 'react';
import { cn } from '../../utils/helpers';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'error' | 'success';
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant = 'default', ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-medium-gray bg-dark-gray px-3 py-2 text-sm text-off-white placeholder:text-light-gray focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
          {
            "border-error focus:ring-error": variant === 'error',
            "border-neon-green focus:ring-neon-green": variant === 'success',
          },
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export default Input;