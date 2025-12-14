'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SystemRole } from '../types/leaves';

interface AuthUser {
  userId: string;
  email: string;
  role: SystemRole;
  employeeId?: string;
  departmentId?: string;
  positionId?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasRole: (roles: SystemRole | SystemRole[]) => boolean;
  hasAnyRole: (roles: SystemRole[]) => boolean;
  isEmployee: () => boolean;
  isManager: () => boolean;
  isHR: () => boolean;
  isAdmin: () => boolean;
  login: (user: AuthUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Try to get user from localStorage or make API call
    const loadUser = async () => {
      try {
        // In production, this would fetch from an API endpoint like /auth/me
        const storedUser = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        } else {
          // Mock user for development - remove in production
          const mockUser: AuthUser = {
            userId: '1',
            email: 'user@example.com',
            role: SystemRole.DEPARTMENT_EMPLOYEE,
            employeeId: 'emp1',
          };
          setUser(mockUser);
        }
      } catch (error) {
        console.error('Failed to load user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const hasRole = (roles: SystemRole | SystemRole[]): boolean => {
    if (!user) return false;
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(user.role);
  };

  const hasAnyRole = (roles: SystemRole[]): boolean => {
    return hasRole(roles);
  };

  const isEmployee = (): boolean => {
    return user?.role === SystemRole.DEPARTMENT_EMPLOYEE;
  };

  const isManager = (): boolean => {
    return user?.role === SystemRole.DEPARTMENT_HEAD;
  };

  const isHR = (): boolean => {
    return [
      SystemRole.HR_ADMIN,
      SystemRole.HR_MANAGER,
      SystemRole.HR_EMPLOYEE,
    ].includes(user?.role || ('' as SystemRole));
  };

  const isAdmin = (): boolean => {
    return [
      SystemRole.SYSTEM_ADMIN,
      SystemRole.HR_MANAGER,
      SystemRole.HR_ADMIN,
    ].includes(user?.role || ('' as SystemRole));
  };

  const login = (userData: AuthUser) => {
    setUser(userData);
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(userData));
    }
  };

  const logout = () => {
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
      localStorage.removeItem('access_token');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        hasRole,
        hasAnyRole,
        isEmployee,
        isManager,
        isHR,
        isAdmin,
        login,
        logout,
      }}
    >
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

