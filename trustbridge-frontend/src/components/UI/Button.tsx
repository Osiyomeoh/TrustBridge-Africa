import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/helpers';

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background",
  {
    variants: {
      variant: {
        default: "bg-neon-green text-text-inverse hover:bg-electric-mint shadow-md",
        destructive: "bg-error text-text-inverse hover:bg-red-700 shadow-md",
        outline: "border border-neon-green text-neon-green hover:bg-neon-green hover:text-text-inverse shadow-sm",
        secondary: "bg-background-tertiary text-text-primary hover:bg-background-tertiary/80 shadow-sm",
        ghost: "hover:bg-background-tertiary hover:text-text-primary",
        link: "underline-offset-4 hover:underline text-neon-green",
        neon: "bg-transparent border-2 border-neon-green text-neon-green hover:bg-neon-green hover:text-text-inverse font-semibold uppercase tracking-wider transition-all duration-300 relative overflow-hidden shadow-md",
        primary: "bg-gradient-to-r from-neon-green to-electric-mint text-text-inverse font-semibold hover:from-electric-mint hover:to-neon-green shadow-lg hover:shadow-neon"
      },
      size: {
        xs: "h-8 px-2 text-xs",
        sm: "h-9 px-3 text-sm rounded-md",
        default: "h-10 py-2 px-4",
        lg: "h-11 px-6 text-lg rounded-md",
        xl: "h-12 px-8 text-xl rounded-md",
        icon: "h-10 w-10"
      },
      fullWidth: {
        true: "w-full",
        false: "w-auto"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      fullWidth: false
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, fullWidth, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export default Button;