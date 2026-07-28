// src/components/common/LoadingSpinner.tsx
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  message: string;
  /** Fill the viewport (app boot) or just the local container (map panel) */
  fullScreen?: boolean;
}

export function LoadingSpinner({ message, fullScreen = true }: LoadingSpinnerProps) {
  return (
    <div
      className={`flex items-center justify-center bg-background transition-colors duration-300 ${
        fullScreen ? 'min-h-screen' : 'h-full min-h-[250px]'
      }`}
    >
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="size-10 animate-spin text-primary motion-reduce:animate-none" aria-hidden="true" />
        <span className="text-sm font-semibold text-secondary-foreground md:text-base">{message}</span>
      </div>
    </div>
  );
}
