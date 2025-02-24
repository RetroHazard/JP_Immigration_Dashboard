import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

const App = React.lazy(() => import('./App'));

const LoadingSpinner = () => (
  <div className="flex min-h-screen items-center justify-center bg-white dark:bg-gray-700">
    <div className="flex flex-col items-center gap-4">
      <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">Loading Dashboard...</span>
    </div>
  </div>
);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Suspense fallback={<LoadingSpinner />}>
      <App />
    </Suspense>
  </React.StrictMode>
);
