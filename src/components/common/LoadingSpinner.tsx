// src/components/common/LoadingSpinner.tsx
import { Icon } from '@iconify/react';

interface LoadingSpinnerProps {
  icon: string;
  message: string;
  className?: string;
}

export function LoadingSpinner({ icon, message }: LoadingSpinnerProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background transition-colors duration-300">
      <div className="flex flex-col items-center gap-4">
        <Icon icon={icon} className="size-12 text-primary" aria-hidden="true" />
        <span className="text-sm font-semibold text-secondary-foreground transition-all md:text-base lg:text-lg">
          {message}
        </span>
      </div>
    </div>
  );
}
