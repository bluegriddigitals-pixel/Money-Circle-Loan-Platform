'use client';

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';  // Changed from next/navigation
import { useAuthStore } from '../store/auth.store';
import { UserRole } from '../constants/enums';

export function useAuth() {
  const navigate = useNavigate();  // Changed from router
  const { user, isLoading, error, login, logout, checkAuth, clearError, isAuthenticated, register } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []);

  const requireAuth = (allowedRoles?: string[]) => {
    if (!isLoading && !user) {
      navigate('/auth/login');  // Changed from router.push
      return false;
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
      navigate('/unauthorized');  // Changed from router.push
      return false;
    }

    return true;
  };

  const hasRole = (roles: UserRole | UserRole[]) => {
    if (!user) return false;
    const rolesArray = Array.isArray(roles) ? roles : [roles];
    return rolesArray.includes(user.role);
  };

  return {
    user,
    isLoading,
    error,
    isAuthenticated,
    login,
    register,
    logout,
    checkAuth,
    clearError,
    requireAuth,
    hasRole,
  };
}