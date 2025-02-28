// src/components/common/LoadingSpinner.tsx
import { Icon } from '@iconify/react';

interface LoadingSpinnerProps {
  icon: string;
  message: string;
  className?: string;
}

export function LoadingSpinner({ icon, message }: LoadingSpinnerProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white transition-colors duration-300 dark:bg-gray-700">
      <div className="flex flex-col items-center gap-4">
        <Icon
          icon={icon}
          className="h-12 w-12 text-indigo-600 dark:text-indigo-300"
          aria-hidden="true"
        />
        <span className="text-sm font-semibold text-gray-700 transition-all dark:text-gray-200 md:text-base lg:text-lg">
          {message}
        </span>
      </div>
    </div>
  );
}

export function PreLoadingSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white transition-colors duration-300 dark:bg-gray-700">
      <div className="flex flex-col items-center gap-4">
        <Icon
          icon="svg-spinners:90-ring-with-bg"
          className="h-12 w-12 text-indigo-600 dark:text-indigo-300"
          aria-hidden="true"
        />
        <span className="text-sm font-semibold text-gray-700 transition-all dark:text-gray-200 md:text-base lg:text-lg">
          Loading Dashboard...
        </span>
      </div>
    </div>
  );
}

export function DataLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white transition-colors duration-300 dark:bg-gray-700">
      <div className="flex flex-col items-center gap-4">
        <Icon
          icon="svg-spinners:90-ring-with-bg"
          className="h-12 w-12 text-indigo-600 dark:text-indigo-300"
          aria-hidden="true"
        />
        <span className="text-sm font-semibold text-gray-700 transition-all dark:text-gray-200 md:text-base lg:text-lg">
            Crunching Immigration Data...
          </span>
      </div>
    </div>
  );
}

export function MapLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white transition-colors duration-300 dark:bg-gray-700">
      <div className="flex flex-col items-center gap-4">
        <Icon
          icon="svg-spinners:90-ring-with-bg"
          className="h-8 w-8 text-indigo-600 dark:text-indigo-300"
          aria-hidden="true"
        />
        <span className="text-sm font-semibold text-gray-700 transition-all dark:text-gray-200 md:text-base lg:text-lg">
          Loading map data...
        </span>
      </div>
    </div>
  )
}