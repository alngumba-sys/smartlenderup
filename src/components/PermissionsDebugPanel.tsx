import { useState } from 'react';
import { usePermissions } from '../contexts/PermissionsContext';
import { useAuth } from '../contexts/AuthContext';
import { Shield, ChevronDown, ChevronUp } from 'lucide-react';
import { PERMISSIONS } from '../utils/permissions';

/**
 * PermissionsDebugPanel - Temporary component to view current user's permissions
 * 
 * Usage: Add this to any page to see what permissions the current user has
 * <PermissionsDebugPanel />
 * 
 * Remove this component in production!
 */
export function PermissionsDebugPanel() {
  const [isExpanded, setIsExpanded] = useState(false);
  const { userRole, getRolePermissions, getRolePermissionsByCategory, hasPermission } = usePermissions();
  const { currentUser } = useAuth();

  if (!currentUser) return null;

  const allPermissions = getRolePermissions();
  const permissionsByCategory = getRolePermissionsByCategory();

  return (
    <div className="fixed bottom-4 right-4 z-[9999] max-w-md">
      {/* Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg shadow-lg hover:bg-purple-700 mb-2"
      >
        <Shield className="size-5" />
        <span className="font-semibold">Permissions: {userRole || 'None'}</span>
        {isExpanded ? <ChevronDown className="size-4" /> : <ChevronUp className="size-4" />}
      </button>

      {/* Expanded Panel */}
      {isExpanded && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 max-h-[600px] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-purple-600 text-white px-4 py-3 border-b border-purple-700">
            <h3 className="font-bold text-lg">Permission Debug Panel</h3>
            <p className="text-sm text-purple-100">
              User: {currentUser.name} | Role: {userRole}
            </p>
            <p className="text-xs text-purple-200">
              Total Permissions: {allPermissions.length}
            </p>
            {userRole === 'Admin' && (
              <div className="mt-2 p-2 bg-green-600 rounded text-xs">
                ✓ Admin has FULL ACCESS to all features
              </div>
            )}
          </div>

          {/* Quick Tests */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-blue-900/20">
            <h4 className="font-semibold text-sm mb-2 text-gray-900 dark:text-white">Quick Permission Tests:</h4>
            <div className="space-y-1 text-xs">
              <PermissionTest 
                label="Can Add Clients?" 
                permission={PERMISSIONS.CLIENTS.ADD_CLIENT}
                hasPermission={hasPermission}
              />
              <PermissionTest 
                label="Can Delete Clients?" 
                permission={PERMISSIONS.CLIENTS.DELETE_CLIENT}
                hasPermission={hasPermission}
              />
              <PermissionTest 
                label="Can View Credit Scores?" 
                permission={PERMISSIONS.CLIENTS.VIEW_CLIENT_CREDIT_SCORE}
                hasPermission={hasPermission}
              />
              <PermissionTest 
                label="Can View Financials?" 
                permission={PERMISSIONS.CLIENTS.VIEW_CLIENT_FINANCIALS}
                hasPermission={hasPermission}
              />
              <PermissionTest 
                label="Can Create Loans?" 
                permission={PERMISSIONS.LOANS.CREATE_LOAN}
                hasPermission={hasPermission}
              />
              <PermissionTest 
                label="Can Disburse Loans?" 
                permission={PERMISSIONS.LOANS.DISBURSE_LOAN}
                hasPermission={hasPermission}
              />
              <PermissionTest 
                label="Can Approve Phase 4?" 
                permission={PERMISSIONS.APPROVALS.APPROVE_PHASE_4}
                hasPermission={hasPermission}
              />
              <PermissionTest 
                label="Can View Bank Balances?" 
                permission={PERMISSIONS.BANK_ACCOUNTS.VIEW_ACCOUNT_BALANCE}
                hasPermission={hasPermission}
              />
            </div>
          </div>

          {/* Permissions by Category */}
          <div className="p-4">
            <h4 className="font-semibold text-sm mb-3 text-gray-900 dark:text-white">
              Permissions by Category:
            </h4>
            <div className="space-y-3">
              {Object.entries(permissionsByCategory).map(([category, perms]) => (
                <CategorySection key={category} category={category} permissions={perms as string[]} />
              ))}
            </div>
          </div>

          {/* All Permissions List */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <h4 className="font-semibold text-sm mb-2 text-gray-900 dark:text-white">
              All Permissions ({allPermissions.length}):
            </h4>
            <div className="max-h-40 overflow-y-auto">
              <ul className="text-xs space-y-0.5 font-mono">
                {allPermissions.map(perm => (
                  <li key={perm} className="text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <span className="text-green-600 dark:text-green-400">✓</span>
                    {perm}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Footer */}
          <div className="p-3 bg-gray-100 dark:bg-gray-800 text-center border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              🔒 Remove this debug panel in production
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper component for permission tests
function PermissionTest({ 
  label, 
  permission, 
  hasPermission 
}: { 
  label: string; 
  permission: string; 
  hasPermission: (perm: string) => boolean;
}) {
  const has = hasPermission(permission);
  return (
    <div className="flex items-center justify-between py-1 px-2 rounded bg-white dark:bg-gray-800">
      <span className="text-gray-700 dark:text-gray-300">{label}</span>
      {has ? (
        <span className="text-green-600 dark:text-green-400 font-semibold">✓ Yes</span>
      ) : (
        <span className="text-red-600 dark:text-red-400 font-semibold">✗ No</span>
      )}
    </div>
  );
}

// Helper component for category sections
function CategorySection({ category, permissions }: { category: string; permissions: string[] }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
      >
        <span className="font-semibold text-sm text-gray-900 dark:text-white">
          {category} ({permissions.length})
        </span>
        {isOpen ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
      </button>
      {isOpen && (
        <div className="p-3 bg-white dark:bg-gray-800">
          <ul className="text-xs space-y-1 font-mono">
            {permissions.map(perm => (
              <li key={perm} className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <span className="text-green-600 dark:text-green-400">✓</span>
                {perm}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
