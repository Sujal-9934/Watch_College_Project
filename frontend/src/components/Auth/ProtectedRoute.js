import React, { useEffect, useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getCurrentUser } from '../../redux/slices/authSlice';

const ProtectedRoute = ({ children }) => {
  const dispatch = useDispatch();
  const { isAuthenticated, loading } = useSelector((state) => state.auth);
  const location = useLocation();
  const hasAttemptedAuth = useRef(false);
  const tokenExists = localStorage.getItem('token');

  useEffect(() => {
    // If token exists but user is not authenticated and not currently loading
    // Try to get user (only if Layout hasn't already started)
    if (tokenExists && !isAuthenticated && !loading && !hasAttemptedAuth.current) {
      hasAttemptedAuth.current = true;
      // Small delay to let Layout's getCurrentUser complete first
      const timer = setTimeout(() => {
        if (!isAuthenticated && !loading) {
          dispatch(getCurrentUser());
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [dispatch, isAuthenticated, loading, tokenExists]);

  // Show loading while:
  // 1. Currently loading user data, OR
  // 2. Token exists but not authenticated yet (waiting for auth check to complete)
  if (loading || (tokenExists && !isAuthenticated)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  // (At this point, loading is false, so auth check has completed)
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // User is authenticated, render children
  return children;
};

export default ProtectedRoute;
