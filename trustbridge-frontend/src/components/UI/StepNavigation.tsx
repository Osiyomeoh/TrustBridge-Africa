import React from 'react';
import { Check, ChevronRight } from 'lucide-react';
import { cn } from '../../utils/helpers';

export interface Step {
  id: string;
  title: string;
  description?: string;
  completed?: boolean;
  current?: boolean;
  disabled?: boolean;
}

interface StepNavigationProps {
  steps: Step[];
  onStepClick?: (stepId: string) => void;
  className?: string;
  showConnectors?: boolean;
}

const StepNavigation: React.FC<StepNavigationProps> = ({
  steps,
  onStepClick,
  className,
  showConnectors = true
}) => {
  return (
    <nav className={cn("flex items-center", className)}>
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          {/* Step Item */}
          <div
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
              step.current
                ? "bg-neon-green/10 border border-neon-green/30 text-neon-green"
                : step.completed
                ? "bg-neon-green/5 border border-neon-green/20 text-neon-green hover:bg-neon-green/10 cursor-pointer"
                : step.disabled
                ? "bg-dark-gray/50 border border-medium-gray/30 text-medium-gray cursor-not-allowed"
                : "bg-dark-gray border border-medium-gray/30 text-off-white hover:bg-dark-gray/80 cursor-pointer"
            )}
            onClick={() => !step.disabled && onStepClick?.(step.id)}
          >
            {/* Step Number/Icon */}
            <div
              className={cn(
                "flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold transition-all duration-200",
                step.current
                  ? "bg-neon-green text-black"
                  : step.completed
                  ? "bg-neon-green text-black"
                  : step.disabled
                  ? "bg-medium-gray/50 text-medium-gray"
                  : "bg-medium-gray text-off-white"
              )}
            >
              {step.completed ? (
                <Check className="w-4 h-4" />
              ) : (
                <span>{index + 1}</span>
              )}
            </div>

            {/* Step Content */}
            <div className="flex flex-col">
              <span className="font-medium text-sm">{step.title}</span>
              {step.description && (
                <span className="text-xs text-medium-gray">{step.description}</span>
              )}
            </div>
          </div>

          {/* Connector */}
          {showConnectors && index < steps.length - 1 && (
            <ChevronRight className="w-4 h-4 text-medium-gray mx-2" />
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default StepNavigation;
