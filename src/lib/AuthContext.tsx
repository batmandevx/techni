'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'viewer';
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user for demo
const MOCK_USER: User = {
  id: '1',
  email: 'admin@tenchi.com',
  name: 'Admin User',
  role: 'admin',
  avatar: undefined,
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check for stored auth token
    const storedUser = localStorage.getItem('tenchi_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('tenchi_user');
      }
    }
    setIsLoading(false);
  }, []);

  // Protected route check
  useEffect(() => {
    if (!isLoading) {
      const publicPaths = ['/auth', '/login', '/signup', '/dashboard-new'];
      const isPublicPath = publicPaths.some(path => pathname?.startsWith(path));
      
      if (!user && !isPublicPath && pathname !== '/') {
        router.push('/auth');
      }
    }
  }, [user, isLoading, pathname, router]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock authentication
    if (email && password) {
      setUser(MOCK_USER);
      localStorage.setItem('tenchi_user', JSON.stringify(MOCK_USER));
      router.push('/');
    }
    
    setIsLoading(false);
  };

  const signup = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Create new user
    const newUser: User = {
      id: Date.now().toString(),
      email,
      name,
      role: 'viewer',
    };
    
    setUser(newUser);
    localStorage.setItem('tenchi_user', JSON.stringify(newUser));
    router.push('/');
    
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('tenchi_user');
    router.push('/auth');
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('tenchi_user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      signup,
      logout,
      updateUser,
    }}>
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
