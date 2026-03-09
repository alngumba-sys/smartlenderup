import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getRolePermissions, RolePermissions } from '../config/rolePermissions';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'Admin' | 'Loan Officer' | 'Manager' | 'Accountant' | 'Collections Officer' | 'Branch Manager' | 'Cashier' | 'Teller' | 'Collector' | 'Operations Manager';
  userType: 'admin' | 'employee' | 'staff'; // Added 'staff' to support staff login
  branch?: string;
  permissions?: RolePermissions | any; // Made more flexible to support both granular and tab-based permissions
  organizationId?: string;
  granularPermissions?: any; // Camel case version
  granular_permissions?: any; // Snake case version (from database)
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
    console.log('🔵 [AuthContext] getInitialUser() called');
    try {
      const storedUser = localStorage.getItem('bvfunguo_user');
      console.log('🔵 [AuthContext] storedUser from localStorage:', storedUser ? 'EXISTS' : 'NULL');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        console.log('🔵 [AuthContext] Parsed user:', user.name, user.role);
        // Ensure permissions are set
        if (!user.permissions) {
          console.log('⚠️ [AuthContext] No permissions found, getting from role:', user.role);
          user.permissions = getRolePermissions(user.role);
        }
        console.log('✅ [AuthContext] Returning user:', user.name);
        return user;
      }
    } catch (error) {
      console.error('❌ [AuthContext] Error loading user from storage:', error);
      console.error('❌ [AuthContext] REMOVING bvfunguo_user due to error!');
      localStorage.removeItem('bvfunguo_user');
    }
    console.log('🔵 [AuthContext] Returning null (no user)');
    return null;
  };

  const [currentUser, setCurrentUser] = useState<User | null>(getInitialUser);
  const [isLoading, setIsLoading] = useState<boolean>(false); // Start as false since we load synchronously

  // Sync currentUser to localStorage whenever it changes - DEFINED BEFORE USE
  const syncToLocalStorage = (user: User | null) => {
    console.log('💾 [AuthContext] syncToLocalStorage called:', user ? user.name : 'NULL');
    try {
      if (user) {
        const userJson = JSON.stringify(user);
        localStorage.setItem('bvfunguo_user', userJson);
        console.log('✅ [AuthContext] Saved to localStorage:', userJson.substring(0, 100) + '...');
        
        // Verify it was saved
        const verify = localStorage.getItem('bvfunguo_user');
        if (!verify) {
          console.error('❌❌❌ [AuthContext] VERIFICATION FAILED! localStorage.setItem did not work!');
        } else {
          console.log('✅ [AuthContext] Verification PASSED - data is in localStorage');
        }
      } else {
        localStorage.removeItem('bvfunguo_user');
        console.log('✅ [AuthContext] Removed from localStorage');
      }
    } catch (error) {
      console.error('❌ [AuthContext] Error syncing to localStorage:', error);
    }
  };

  // Monitor currentUser changes and sync to localStorage
  useEffect(() => {
    console.log('🔄 [AuthContext] currentUser changed:', currentUser ? currentUser.name : 'NULL');
    
    // Verify localStorage is in sync
    const storedUser = localStorage.getItem('bvfunguo_user');
    const isInSync = currentUser ? !!storedUser : !storedUser;
    
    if (!isInSync) {
      console.warn('⚠️ [AuthContext] OUT OF SYNC! React state and localStorage mismatch');
      console.warn('  - React state has user:', !!currentUser);
      console.warn('  - localStorage has user:', !!storedUser);
      console.warn('  - Re-syncing now...');
      syncToLocalStorage(currentUser);
    } else {
      console.log('✅ [AuthContext] React state and localStorage are IN SYNC');
    }
  }, [currentUser]);

  // Expose debug function globally
  useEffect(() => {
    (window as any).debugAuthState = () => {
      console.log('🔍 ===== AUTH STATE DEBUG =====');
      console.log('currentUser:', currentUser);
      console.log('localStorage bvfunguo_user:', localStorage.getItem('bvfunguo_user'));
      console.log('isAuthenticated:', !!currentUser);
      console.log('==============================');
      return {
        currentUser,
        localStorage: localStorage.getItem('bvfunguo_user'),
        isAuthenticated: !!currentUser
      };
    };
    
    (window as any).forceSync = () => {
      console.log('🔧 Forcing sync to localStorage...');
      syncToLocalStorage(currentUser);
      console.log('✅ Sync complete');
    };
  }, [currentUser]);

  const login = (user: User) => {
    console.log('🟢 [AuthContext] login() called for:', user.name, user.role);
    console.log('🟢 [AuthContext] Input user object:', user);
    console.log('🟢 [AuthContext] Has granular_permissions?', !!user.granular_permissions);
    console.log('🟢 [AuthContext] Has granularPermissions?', !!user.granularPermissions);
    
    // Set permissions based on role if not provided
    const userWithPermissions = {
      ...user,
      permissions: user.permissions || getRolePermissions(user.role),
      // Explicitly preserve granular permissions (both formats)
      granular_permissions: user.granular_permissions,
      granularPermissions: user.granularPermissions
    };
    
    console.log('🟢 [AuthContext] Final user object:', userWithPermissions);
    console.log('🟢 [AuthContext] Final has granular_permissions?', !!userWithPermissions.granular_permissions);
    console.log('🟢 [AuthContext] Setting currentUser state');
    setCurrentUser(userWithPermissions);
    console.log('🟢 [AuthContext] Syncing to localStorage');
    syncToLocalStorage(userWithPermissions);
  };

  const logout = () => {
    console.log('🔴🔴🔴 [AuthContext] logout() CALLED!');
    console.trace('🔴 LOGOUT STACK TRACE:');
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