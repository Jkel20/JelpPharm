import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface PrivilegeProtectedRouteProps {
  children: React.ReactNode;
  requiredPrivilege: string;
  fallbackPath?: string;
}

export const PrivilegeProtectedRoute: React.FC<PrivilegeProtectedRouteProps> = ({
  children, 
  requiredPrivilege, 
  fallbackPath = '/unauthorized' 
}) => {
  const { user, hasPrivilege, isLoading } = useAuth();

  // Show loading while checking privileges
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has required privilege
  if (!hasPrivilege(requiredPrivilege)) {
    console.warn(`User ${user.email} attempted to access route requiring privilege: ${requiredPrivilege}`);
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
};
