import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h2 className="text-9xl font-bold text-gray-300">404</h2>
          <h3 className="mt-4 text-3xl font-bold text-gray-900">Page not found</h3>
          <p className="mt-4 text-gray-600">
            Sorry, we couldn't find the page you're looking for.
          </p>
        </div>
        <div>
          <Link
            to="/dashboard"
            className="btn-primary inline-flex items-center"
          >
            <Home className="h-4 w-4 mr-2" />
            Go back home
          </Link>
        </div>
      </div>
    </div>
  );
};