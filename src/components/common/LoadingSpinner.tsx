import { Icon } from '@iconify/react';

export function LoadingSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white dark:bg-gray-700">
      <div className="flex flex-col items-center gap-4">
        <Icon
          icon="svg-spinners:90-ring-with-bg"
          className="h-12 w-12 text-indigo-600 dark:text-indigo-300"
          aria-hidden="true"
        />
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">Loading Dashboard...</span>
      </div>
    </div>
  );
}
