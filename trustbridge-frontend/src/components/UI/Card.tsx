import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/helpers';

const cardVariants = cva(
  "rounded-xl border transition-all duration-300",
  {
    variants: {
      variant: {
        default: "bg-dark-gray border-medium-gray text-off-white texture-pattern",
        floating: "bg-dark-gray/50 border-neon-green/30 text-off-white backdrop-blur-sm hover:border-neon-green/50 hover:shadow-lg hover:shadow-neon-green/10 texture-pattern",
        neon: "bg-dark-gray border-neon-green text-off-white shadow-lg shadow-neon-green/20 hover:shadow-neon-green/30 texture-pattern",
        glass: "bg-dark-gray/30 border-medium-gray/30 text-off-white backdrop-blur-md texture-pattern",
        glow: "bg-dark-gray border-neon-green/50 text-off-white shadow-lg shadow-neon-green/20 texture-pattern"
      },
      padding: {
        default: "p-6",
        sm: "p-4",
        lg: "p-8",
        none: "p-0"
      }
    },
    defaultVariants: {
      variant: "default",
      padding: "default"
    }
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(cardVariants({ variant, padding }), className)}
        {...props}
      />
    );
  }
);

Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 pb-4", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-lg font-semibold leading-none tracking-tight", className)}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-off-white/70", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center pt-4", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
export default Card;