'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthService, AuthUser } from '@/lib/auth';

interface AuthContextType {
  user: AuthUser | null;
  signUp: (email: string, username: string, role?: 'admin' | 'player') => Promise<AuthUser>;
  signIn: (email: string) => Promise<AuthUser>;
  signOut: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated
    const currentUser = AuthService.getCurrentUser();
    setUser(currentUser);
    setIsLoading(false);
  }, []);

  const signUp = async (email: string, username: string, role: 'admin' | 'player' = 'player') => {
    try {
      const newUser = await AuthService.signUp(email, username, role);
      setUser(newUser);
      return newUser;
    } catch (error) {
      throw error;
    }
  };

  const signIn = async (email: string) => {
    try {
      const user = await AuthService.signIn(email);
      setUser(user);
      return user;
    } catch (error) {
      throw error;
    }
  };

  const signOut = () => {
    AuthService.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, signUp, signIn, signOut, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
