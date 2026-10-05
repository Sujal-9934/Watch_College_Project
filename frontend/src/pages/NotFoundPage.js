import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-gray-300">404</h1>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Page Not Found</h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          Sorry, we couldn't find the page you're looking for. The page might have been moved, deleted, or you entered the wrong URL.
        </p>
        <div className="space-x-4">
          <Link
            to="/"
            className="bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors"
          >
            Go Home
          </Link>
          <Link
            to="/products"
            className="bg-white text-primary-600 border border-primary-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Browse Watches
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
