import React from 'react';
import { Navigate } from 'react-router-dom';
import AuthProvider from './AuthProvider';

const { useAuth } = AuthProvider;

export const ProtectedRoute = ({ element, allowedRoles }) => {
  const { user, token, isLoading } = useAuth();
  console.log('ProtectedRoute:', { user, token, allowedRoles, isLoading });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Check both token and user existence
  if (!token || !user) {
    console.log('Redirecting to /login: No session or user');
    return <Navigate to="/login" replace />;
  }

  // Check user role
  if (!allowedRoles.includes(user.role)) {
    console.log(`Access denied for role ${user.role}`);
    // Redirect to appropriate dashboard based on role
    const roleRoutes = {
      user: '/user',
      admin: '/admin',
      provider: '/provider',
      doctor: '/provider'
    };
    return <Navigate to={roleRoutes[user.role] || '/'} replace />;
  }

  console.log(`Access granted for role ${user.role}`);
  return element;
};