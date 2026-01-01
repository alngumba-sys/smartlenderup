import { createContext, useContext, useState, ReactNode } from 'react';
import { getRolePermissions, RolePermissions } from '../config/rolePermissions';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'Admin' | 'Loan Officer' | 'Manager' | 'Accountant' | 'Collections Officer' | 'Branch Manager' | 'Cashier' | 'Teller' | 'Collector' | 'Operations Manager';
  userType: 'admin' | 'employee';
  branch?: string;
  permissions?: RolePermissions;
  organizationId?: string;
}

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => void;
  hasPermission: (permission: keyof User['permissions']) => boolean;
  isAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Load user immediately from localStorage - BEFORE any state initialization
  const getInitialUser = (): User | null => {
    try {
      const storedUser = localStorage.getItem('bvfunguo_user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        // Ensure permissions are set
        if (!user.permissions) {
          user.permissions = getRolePermissions(user.role);
        }
        return user;
      }
    } catch (error) {
      console.error('Error loading user from storage:', error);
      localStorage.removeItem('bvfunguo_user');
    }
    return null;
  };

  const [currentUser, setCurrentUser] = useState<User | null>(getInitialUser);
  const [isLoading, setIsLoading] = useState<boolean>(false); // Start as false since we load synchronously

  const login = (user: User) => {
    // Set permissions based on role if not provided
    const userWithPermissions = {
      ...user,
      permissions: user.permissions || getRolePermissions(user.role)
    };
    
    setCurrentUser(userWithPermissions);
    localStorage.setItem('bvfunguo_user', JSON.stringify(userWithPermissions));
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('bvfunguo_user');
    localStorage.removeItem('bvfunguo_remember_me');
    // Don't clear credentials - let Remember Me persist across sessions
  };

  const hasPermission = (permission: keyof User['permissions']): boolean => {
    if (!currentUser || !currentUser.permissions) return false;
    
    // Admin always has all permissions
    if (currentUser.userType === 'admin' || currentUser.role === 'Admin') {
      return true;
    }
    
    return currentUser.permissions[permission] === true;
  };

  const isAdmin = (): boolean => {
    return currentUser?.userType === 'admin' || currentUser?.role === 'Admin';
  };

  const isAuthenticated = !!currentUser;

  return (
    <AuthContext.Provider 
      value={{ 
        currentUser, 
        isAuthenticated, 
        isLoading,
        login, 
        logout, 
        hasPermission,
        isAdmin 
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