import { ReactNode, ButtonHTMLAttributes } from 'react';
import { usePermissions } from '../contexts/PermissionsContext';
import { Permission } from '../utils/permissions';

interface PermissionGateProps {
  permission: Permission;
  children: ReactNode;
  fallback?: ReactNode;
  requireAll?: boolean; // If true with array, require ALL permissions
}

interface PermissionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  permission: Permission;
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * PermissionGate - Conditionally renders children based on permissions
 * 
 * Usage:
 * <PermissionGate permission={PERMISSIONS.LOANS.CREATE_LOAN}>
 *   <button>Create Loan</button>
 * </PermissionGate>
 * 
 * With fallback:
 * <PermissionGate 
 *   permission={PERMISSIONS.CLIENTS.DELETE_CLIENT}
 *   fallback={<span className="text-gray-400">No Permission</span>}
 * >
 *   <button>Delete</button>
 * </PermissionGate>
 */
export function PermissionGate({ permission, children, fallback = null }: PermissionGateProps) {
  const { hasPermission } = usePermissions();
  
  if (!hasPermission(permission)) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
}

/**
 * MultiPermissionGate - Check multiple permissions
 * 
 * Usage:
 * // Requires ANY of these permissions
 * <MultiPermissionGate permissions={[PERMISSIONS.LOANS.EDIT_LOAN, PERMISSIONS.LOANS.CREATE_LOAN]}>
 *   <button>Edit/Create</button>
 * </MultiPermissionGate>
 * 
 * // Requires ALL of these permissions
 * <MultiPermissionGate permissions={[...]} requireAll>
 *   <button>Advanced Action</button>
 * </MultiPermissionGate>
 */
export function MultiPermissionGate({ 
  permissions, 
  children, 
  fallback = null,
  requireAll = false 
}: { 
  permissions: Permission[];
  children: ReactNode;
  fallback?: ReactNode;
  requireAll?: boolean;
}) {
  const { hasAnyPermission, hasAllPermissions } = usePermissions();
  
  const hasAccess = requireAll 
    ? hasAllPermissions(permissions)
    : hasAnyPermission(permissions);
  
  if (!hasAccess) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
}

/**
 * PermissionButton - A button that only renders if user has permission
 * 
 * Usage:
 * <PermissionButton 
 *   permission={PERMISSIONS.CLIENTS.ADD_CLIENT}
 *   onClick={handleAddClient}
 *   className="px-4 py-2 bg-blue-600 text-white rounded"
 * >
 *   Add Client
 * </PermissionButton>
 */
export function PermissionButton({ 
  permission, 
  children, 
  fallback = null,
  ...buttonProps 
}: PermissionButtonProps) {
  const { hasPermission } = usePermissions();
  
  if (!hasPermission(permission)) {
    return <>{fallback}</>;
  }
  
  return <button {...buttonProps}>{children}</button>;
}
