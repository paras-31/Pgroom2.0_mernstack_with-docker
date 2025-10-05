import { ReactNode, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: number[]; // Optional array of allowed role IDs
}

/**
 * Protected Route Component
 *
 * Wraps routes that require authentication
 * Redirects to login page if user is not authenticated
 * Redirects to unauthorized page if user doesn't have the required role
 *
 * @param children - The route component to render if authenticated
 * @param allowedRoles - Optional array of role IDs allowed to access this route
 */
const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, userRole, loading, checkAuth } = useAuth();
  const location = useLocation();

  // Force a check of authentication status
  const isCurrentlyAuthenticated = checkAuth();

  // If still loading, show nothing (or could show a loading spinner)
  if (loading) {
    return null;
  }

  // If not authenticated, redirect to login page
  if (!isAuthenticated || !isCurrentlyAuthenticated) {
    // Show a toast notification
    toast.error('Please log in to access this page');
    // Save the location they were trying to go to
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If roles are specified and user doesn't have the required role, redirect to unauthorized
  if (allowedRoles && allowedRoles.length > 0 && userRole !== null) {
    if (!allowedRoles.includes(userRole)) {
      toast.error('You do not have permission to access this page');
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // If authenticated and has the required role, render the children
  return <>{children}</>;
};

export default ProtectedRoute;
