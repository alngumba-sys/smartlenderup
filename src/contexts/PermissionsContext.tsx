import { createContext, useContext, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { 
  hasPermission, 
  hasAnyPermission, 
  hasAllPermissions, 
  getRolePermissions,
  getRolePermissionsByCategory,
  type Permission,
  type Role 
} from '../utils/permissions';

interface PermissionsContextType {
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;
  getRolePermissions: () => Permission[];
  getRolePermissionsByCategory: () => Record<string, Permission[]>;
  userRole: Role | undefined;
  customPermissions: Permission[] | undefined;
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

export function PermissionsProvider({ children }: { children: ReactNode }) {
  const { currentUser } = useAuth();
  const userRole = currentUser?.role as Role | undefined;
  
  // Extract custom permissions from user's granularPermissions
  let customPermissions: Permission[] | undefined;
  
  if (currentUser) {
    try {
      // Check both camelCase and snake_case keys for compatibility
      const granularPerms = currentUser.granularPermissions || currentUser.granular_permissions;
      
      if (granularPerms) {
        // Parse if it's a string
        const parsedPerms = typeof granularPerms === 'string' 
          ? JSON.parse(granularPerms)
          : granularPerms;
        
        if (parsedPerms?.customPermissions && Array.isArray(parsedPerms.customPermissions)) {
          customPermissions = parsedPerms.customPermissions;
          console.log('🔑 [PERMISSIONS] Loaded custom permissions:', customPermissions.length, 'permissions');
          console.log('🔑 [PERMISSIONS] Custom permissions list:', customPermissions);
        } else {
          console.log('⚠️ [PERMISSIONS] No customPermissions found in granularPermissions');
        }
      }
    } catch (error) {
      console.error('❌ [PERMISSIONS] Failed to parse granular permissions:', error);
    }
  }

  const contextValue: PermissionsContextType = {
    hasPermission: (permission: Permission) => hasPermission(userRole, permission, customPermissions),
    hasAnyPermission: (permissions: Permission[]) => hasAnyPermission(userRole, permissions, customPermissions),
    hasAllPermissions: (permissions: Permission[]) => hasAllPermissions(userRole, permissions, customPermissions),
    getRolePermissions: () => getRolePermissions(userRole, customPermissions),
    getRolePermissionsByCategory: () => getRolePermissionsByCategory(userRole, customPermissions),
    userRole,
    customPermissions,
  };

  return (
    <PermissionsContext.Provider value={contextValue}>
      {children}
    </PermissionsContext.Provider>
  );
}

export function usePermissions() {
  const context = useContext(PermissionsContext);
  if (context === undefined) {
    throw new Error('usePermissions must be used within a PermissionsProvider');
  }
  return context;
}