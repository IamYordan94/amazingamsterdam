'use client';

import React from 'react';

interface MobileOptimizedProps {
  children: React.ReactNode;
  className?: string;
}

export function MobileOptimized({ children, className = '' }: MobileOptimizedProps) {
  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      {/* Mobile viewport meta tag is handled in layout.tsx */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </div>
  );
}

// Mobile-specific navigation component
export function MobileNav() {
  return (
    <nav className="bg-white shadow-lg md:hidden">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-primary-600">LocationGaming</span>
          <button className="text-gray-600 hover:text-gray-900">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
}

// Mobile-optimized card component
export function MobileCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-lg shadow-md p-4 sm:p-6 ${className}`}>
      {children}
    </div>
  );
}

// Mobile-optimized button component
export function MobileButton({ 
  children, 
  onClick, 
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false 
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
}) {
  const baseClasses = 'font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-lg';
  
  const variantClasses = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
    success: 'bg-secondary-600 text-white hover:bg-secondary-700 focus:ring-secondary-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  };
  
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };
  
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className}`}
    >
      {children}
    </button>
  );
}

// Mobile-optimized input component
export function MobileInput({ 
  type = 'text',
  placeholder = '',
  value = '',
  onChange,
  className = '',
  ...props 
}: {
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  [key: string]: any;
}) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base ${className}`}
      {...props}
    />
  );
}

// Mobile-optimized grid component
export function MobileGrid({ 
  children, 
  cols = 1,
  gap = 4,
  className = '' 
}: {
  children: React.ReactNode;
  cols?: 1 | 2 | 3 | 4;
  gap?: 2 | 4 | 6 | 8;
  className?: string;
}) {
  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  };
  
  const gapClasses = {
    2: 'gap-2',
    4: 'gap-4',
    6: 'gap-6',
    8: 'gap-8',
  };
  
  return (
    <div className={`grid ${gridClasses[cols]} ${gapClasses[gap]} ${className}`}>
      {children}
    </div>
  );
}

// Mobile-optimized text component
export function MobileText({ 
  children, 
  size = 'base',
  weight = 'normal',
  color = 'gray-900',
  className = '' 
}: {
  children: React.ReactNode;
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  color?: string;
  className?: string;
}) {
  const sizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl',
  };
  
  const weightClasses = {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
  };
  
  return (
    <span className={`${sizeClasses[size]} ${weightClasses[weight]} text-${color} ${className}`}>
      {children}
    </span>
  );
}
