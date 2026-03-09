import { useState } from 'react';
import { Shield, Lock, Unlock, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../contexts/PermissionsContext';
import { 
  canViewTab, 
  canCreateInTab, 
  canEditInTab, 
  canDeleteInTab,
  type TabKey 
} from '../utils/staffPermissions';
import { PERMISSIONS } from '../utils/permissions';

/**
 * PermissionsComparison - Shows both permission systems side-by-side
 * 
 * Helps visualize the difference between:
 * 1. Tab-based CRUD permissions (System 1 - Advanced)
 * 2. Granular atomic permissions (System 2 - New)
 */
export function PermissionsComparison() {
  const [isExpanded, setIsExpanded] = useState(false);
  const { currentUser } = useAuth();
  const { userRole, hasPermission } = usePermissions();

  if (!currentUser) return null;

  // Tab keys to test
  const tabKeys: TabKey[] = [
    'dashboard',
    'operations_loans',
    'operations_clients',
    'accounting_chart',
    'reports_par',
    'payroll',
    'settings'
  ];

  // Sample granular permissions to test
  const samplePermissions = [
    { label: 'View Clients', perm: PERMISSIONS.CLIENTS.VIEW_CLIENTS },
    { label: 'Add Client', perm: PERMISSIONS.CLIENTS.ADD_CLIENT },
    { label: 'Delete Client', perm: PERMISSIONS.CLIENTS.DELETE_CLIENT },
    { label: 'View Credit Score', perm: PERMISSIONS.CLIENTS.VIEW_CLIENT_CREDIT_SCORE },
    { label: 'View Financials', perm: PERMISSIONS.CLIENTS.VIEW_CLIENT_FINANCIALS },
    { label: 'Create Loan', perm: PERMISSIONS.LOANS.CREATE_LOAN },
    { label: 'Edit Loan', perm: PERMISSIONS.LOANS.EDIT_LOAN },
    { label: 'Delete Loan', perm: PERMISSIONS.LOANS.DELETE_LOAN },
    { label: 'Disburse Loan', perm: PERMISSIONS.LOANS.DISBURSE_LOAN },
    { label: 'Write Off Loan', perm: PERMISSIONS.LOANS.WRITE_OFF_LOAN },
    { label: 'Approve Phase 1', perm: PERMISSIONS.APPROVALS.APPROVE_PHASE_1 },
    { label: 'Approve Phase 4', perm: PERMISSIONS.APPROVALS.APPROVE_PHASE_4 },
    { label: 'View Bank Balance', perm: PERMISSIONS.BANK_ACCOUNTS.VIEW_ACCOUNT_BALANCE },
    { label: 'Delete Journal Entry', perm: PERMISSIONS.ACCOUNTING.DELETE_JOURNAL_ENTRY },
  ];

  return (
    <div className="fixed bottom-20 right-4 z-[9998] max-w-4xl">
      {/* Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 mb-2"
      >
        <Shield className="size-5" />
        <span className="font-semibold">Compare Permissions</span>
        {isExpanded ? <ChevronDown className="size-4" /> : <ChevronUp className="size-4" />}
      </button>

      {/* Expanded Panel */}
      {isExpanded && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 max-h-[600px] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-blue-600 text-white px-4 py-3 border-b border-blue-700">
            <h3 className="font-bold text-lg">Permission Systems Comparison</h3>
            <p className="text-sm text-blue-100">
              User: {currentUser.name} | Role: {userRole} ({currentUser.role})
            </p>
          </div>

          {/* System 1: Tab-Based CRUD */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h4 className="font-bold text-lg mb-2 text-gray-900 dark:text-white flex items-center gap-2">
              <Lock className="size-5 text-orange-600" />
              System 1: Tab-Based CRUD (Advanced)
            </h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
              Coarse-grained permissions at tab level (View, Create, Edit, Delete per tab)
            </p>
            
            <div className="space-y-2">
              {tabKeys.map(tabKey => {
                const canView = canViewTab(tabKey);
                const canCreate = canCreateInTab(tabKey);
                const canEdit = canEditInTab(tabKey);
                const canDelete = canDeleteInTab(tabKey);
                
                return (
                  <div 
                    key={tabKey}
                    className="p-2 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600"
                  >
                    <div className="font-semibold text-sm text-gray-900 dark:text-white mb-1">
                      {tabKey.replace(/_/g, ' ').toUpperCase()}
                    </div>
                    <div className="flex gap-2 text-xs">
                      <PermBadge allowed={canView} label="View" />
                      <PermBadge allowed={canCreate} label="Create" />
                      <PermBadge allowed={canEdit} label="Edit" />
                      <PermBadge allowed={canDelete} label="Delete" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* System 2: Granular Atomic */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h4 className="font-bold text-lg mb-2 text-gray-900 dark:text-white flex items-center gap-2">
              <Unlock className="size-5 text-green-600" />
              System 2: Granular Atomic (New)
            </h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
              Fine-grained permissions for specific actions (300+ permissions across 19 categories)
            </p>
            
            <div className="grid grid-cols-2 gap-2">
              {samplePermissions.map(({ label, perm }) => {
                const allowed = hasPermission(perm);
                
                return (
                  <div 
                    key={perm}
                    className={`p-2 rounded border ${
                      allowed 
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                        : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-900 dark:text-white">
                        {label}
                      </span>
                      {allowed ? (
                        <span className="text-xs text-green-700 dark:text-green-400 font-bold">✓</span>
                      ) : (
                        <span className="text-xs text-red-700 dark:text-red-400 font-bold">✗</span>
                      )}
                    </div>
                    <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                      {perm}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Comparison Summary */}
          <div className="p-4 bg-gray-50 dark:bg-gray-900">
            <h4 className="font-semibold text-sm mb-2 text-gray-900 dark:text-white">
              📊 Summary
            </h4>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">System 1 Permissions:</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {tabKeys.filter(t => canViewTab(t)).length} / {tabKeys.length} tabs viewable
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">System 2 Permissions:</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {samplePermissions.filter(p => hasPermission(p.perm)).length} / {samplePermissions.length} actions allowed
                </span>
              </div>
              <div className="mt-2 p-2 bg-blue-100 dark:bg-blue-900/20 rounded text-gray-700 dark:text-gray-300">
                {userRole === 'Admin' || currentUser.role === 'Admin' ? (
                  <>
                    <strong>You're an Admin:</strong> Both systems grant you nearly full access. 
                    Test with a limited role (Viewer, Cashier) to see restrictions.
                  </>
                ) : (
                  <>
                    <strong>Limited Role:</strong> Your permissions are restricted based on your role.
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper component for permission badges
function PermBadge({ allowed, label }: { allowed: boolean; label: string }) {
  return (
    <span 
      className={`px-2 py-0.5 rounded text-xs font-semibold ${
        allowed 
          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
          : 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500'
      }`}
    >
      {allowed ? '✓' : '✗'} {label}
    </span>
  );
}
