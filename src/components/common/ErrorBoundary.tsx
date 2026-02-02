// src/components/common/ErrorBoundary.tsx
import React from 'react';

import { logger } from '../../utils/logger';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

/**
 * Error boundary component that catches rendering errors and displays a fallback UI.
 * Prevents the entire app from crashing when a component throws an error.
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so next render shows fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error details using environment-aware logger
    logger.error('ErrorBoundary caught an error:', error, errorInfo);

    // You can also log to an error reporting service here
    // Example: logErrorToService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Render custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
            <h1 className="mb-4 text-2xl font-bold text-red-600">Something went wrong</h1>
            <p className="mb-4 text-gray-700 dark:text-gray-300">
              An error occurred while rendering the application.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
            >
              Reload Page
            </button>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <pre className="mt-4 overflow-auto rounded bg-gray-100 p-4 text-xs dark:bg-gray-700">
                {this.state.error.toString()}
              </pre>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
