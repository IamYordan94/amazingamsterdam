'use client';

import React from 'react';
import { useAuth } from './AuthProvider';
import { useRouter } from 'next/navigation';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  fallback?: React.ReactNode;
}

export function ProtectedRoute({ children, requireAdmin = false, fallback }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    if (fallback) {
      return <>{fallback}</>;
    }
    router.push('/auth/signin');
    return null;
  }

  if (requireAdmin && user.role !== 'admin') {
    if (fallback) {
      return <>{fallback}</>;
    }
    router.push('/');
    return null;
  }

  return <>{children}</>;
}
