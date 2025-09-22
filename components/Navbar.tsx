'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from './AuthProvider';
import { useRouter } from 'next/navigation';

export function Navbar() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = () => {
    signOut();
    router.push('/');
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-primary-600">LocationGaming</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link href="/dashboard" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
                  Dashboard
                </Link>
                {user.role === 'admin' && (
                  <Link href="/admin" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
                    Admin Panel
                  </Link>
                )}
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-700">Welcome, {user.username}</span>
                  <button
                    onClick={handleSignOut}
                    className="btn btn-secondary text-sm"
                  >
                    Sign Out
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link href="/auth/signin" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
                  Sign In
                </Link>
                <Link href="/auth/signup" className="btn btn-primary text-sm">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
