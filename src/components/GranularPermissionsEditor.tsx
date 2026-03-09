import { useState, useMemo } from 'react';
import { Shield, Check, X, ChevronDown, ChevronUp, Search, Filter } from 'lucide-react';
import { PERMISSIONS, ROLE_PERMISSIONS, type Role, type Permission } from '../utils/permissions';

interface GranularPermissionsEditorProps {
  selectedRole: Role | null;
  customPermissions: Permission[];
  onRoleChange: (role: Role | null) => void;
  onPermissionsChange: (permissions: Permission[]) => void;
}

/**
 * GranularPermissionsEditor - UI for assigning 300+ atomic permissions
 * 
 * Allows Admin to:
 * 1. Select a predefined role (gets all role permissions automatically)
 * 2. Customize permissions by category
 * 3. Search and filter permissions
 */
export function GranularPermissionsEditor({
  selectedRole,
  customPermissions,
  onRoleChange,
  onPermissionsChange,
}: GranularPermissionsEditorProps) {
  const [usePresetRole, setUsePresetRole] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showOnlyGranted, setShowOnlyGranted] = useState(false);

  // Get current permissions (either from role or custom)
  const currentPermissions = usePresetRole && selectedRole 
    ? ROLE_PERMISSIONS[selectedRole] 
    : customPermissions;

  // Group permissions by category
  const permissionCategories = useMemo(() => {
    return Object.entries(PERMISSIONS).map(([categoryKey, categoryPerms]) => ({
      key: categoryKey,
      name: formatCategoryName(categoryKey),
      permissions: Object.entries(categoryPerms).map(([permKey, permValue]) => ({
        key: permKey,
        value: permValue as string,
        label: formatPermissionLabel(permKey),
      })),
    }));
  }, []);

  // Filter permissions based on search and filter
  const filteredCategories = useMemo(() => {
    return permissionCategories.map(category => ({
      ...category,
      permissions: category.permissions.filter(perm => {
        // Search filter
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          const matchesLabel = perm.label.toLowerCase().includes(query);
          const matchesValue = perm.value.toLowerCase().includes(query);
          if (!matchesLabel && !matchesValue) return false;
        }

        // Show only granted filter
        if (showOnlyGranted && !currentPermissions.includes(perm.value)) {
          return false;
        }

        return true;
      }),
    })).filter(category => category.permissions.length > 0);
  }, [permissionCategories, searchQuery, showOnlyGranted, currentPermissions]);

  const toggleCategory = (categoryKey: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryKey)
        ? prev.filter(k => k !== categoryKey)
        : [...prev, categoryKey]
    );
  };

  const togglePermission = (permValue: string) => {
    if (usePresetRole) {
      // Switch to custom mode when manually toggling
      setUsePresetRole(false);
      onRoleChange(null);
    }

    const newPermissions = customPermissions.includes(permValue)
      ? customPermissions.filter(p => p !== permValue)
      : [...customPermissions, permValue];
    
    onPermissionsChange(newPermissions);
  };

  const selectAllInCategory = (category: typeof permissionCategories[0]) => {
    if (usePresetRole) {
      setUsePresetRole(false);
      onRoleChange(null);
    }

    const categoryPermValues = category.permissions.map(p => p.value);
    const newPermissions = [...new Set([...customPermissions, ...categoryPermValues])];
    onPermissionsChange(newPermissions);
  };

  const deselectAllInCategory = (category: typeof permissionCategories[0]) => {
    if (usePresetRole) {
      setUsePresetRole(false);
      onRoleChange(null);
    }

    const categoryPermValues = category.permissions.map(p => p.value);
    const newPermissions = customPermissions.filter(p => !categoryPermValues.includes(p));
    onPermissionsChange(newPermissions);
  };

  const getCategoryStats = (category: typeof permissionCategories[0]) => {
    const total = category.permissions.length;
    const granted = category.permissions.filter(p => currentPermissions.includes(p.value)).length;
    return { total, granted };
  };

  return (
    <div className="space-y-4">
      {/* Role Selection */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Permission Assignment Method
        </label>
        
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              checked={usePresetRole}
              onChange={() => setUsePresetRole(true)}
              className="text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Use Preset Role</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              checked={!usePresetRole}
              onChange={() => setUsePresetRole(false)}
              className="text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Custom Permissions</span>
          </label>
        </div>

        {usePresetRole && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Role
            </label>
            <select
              value={selectedRole || ''}
              onChange={(e) => onRoleChange(e.target.value as Role || null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select a role...</option>
              <option value="Admin">Admin (280+ permissions)</option>
              <option value="Manager">Manager (200+ permissions)</option>
              <option value="Loan Officer">Loan Officer (120+ permissions)</option>
              <option value="Accountant">Accountant (80+ permissions)</option>
              <option value="Cashier">Cashier (60+ permissions)</option>
              <option value="Auditor">Auditor (100+ read-only permissions)</option>
              <option value="Viewer">Viewer (20+ minimal permissions)</option>
            </select>
            {selectedRole && (
              <p className="mt-1 text-xs text-gray-500">
                {ROLE_PERMISSIONS[selectedRole].length} permissions included in this role
              </p>
            )}
          </div>
        )}
      </div>

      {/* Search and Filter */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search permissions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>
        <button
          onClick={() => setShowOnlyGranted(!showOnlyGranted)}
          className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-sm transition-colors ${
            showOnlyGranted
              ? 'bg-blue-50 border-blue-300 text-blue-700'
              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Filter className="size-4" />
          {showOnlyGranted ? 'Granted Only' : 'All'}
        </button>
      </div>

      {/* Permission Categories */}
      <div className="border border-gray-200 rounded-lg max-h-96 overflow-y-auto">
        {filteredCategories.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No permissions found matching your criteria
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredCategories.map(category => {
              const stats = getCategoryStats(category);
              const isExpanded = expandedCategories.includes(category.key);
              const allGranted = stats.granted === stats.total;
              const someGranted = stats.granted > 0 && stats.granted < stats.total;

              return (
                <div key={category.key}>
                  {/* Category Header */}
                  <div
                    className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 cursor-pointer"
                    onClick={() => toggleCategory(category.key)}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <Shield className="size-4 text-gray-600" />
                      <span className="font-medium text-gray-900">{category.name}</span>
                      <span className="text-xs text-gray-500">
                        {stats.granted} / {stats.total}
                      </span>
                      {allGranted && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                          All Granted
                        </span>
                      )}
                      {someGranted && (
                        <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                          Partial
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {!usePresetRole && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              selectAllInCategory(category);
                            }}
                            className="text-xs text-blue-600 hover:text-blue-700 px-2 py-1 hover:bg-blue-50 rounded"
                          >
                            Grant All
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deselectAllInCategory(category);
                            }}
                            className="text-xs text-red-600 hover:text-red-700 px-2 py-1 hover:bg-red-50 rounded"
                          >
                            Revoke All
                          </button>
                        </>
                      )}
                      {isExpanded ? (
                        <ChevronUp className="size-4 text-gray-400" />
                      ) : (
                        <ChevronDown className="size-4 text-gray-400" />
                      )}
                    </div>
                  </div>

                  {/* Category Permissions */}
                  {isExpanded && (
                    <div className="p-3 bg-white">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {category.permissions.map(perm => {
                          const isGranted = currentPermissions.includes(perm.value);

                          return (
                            <label
                              key={perm.value}
                              className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
                                isGranted
                                  ? 'bg-green-50 hover:bg-green-100'
                                  : 'bg-gray-50 hover:bg-gray-100'
                              } ${usePresetRole ? 'cursor-not-allowed opacity-60' : ''}`}
                            >
                              <input
                                type="checkbox"
                                checked={isGranted}
                                onChange={() => togglePermission(perm.value)}
                                disabled={usePresetRole}
                                className="text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-gray-900 truncate">
                                  {perm.label}
                                </div>
                                <div className="text-xs text-gray-500 truncate">
                                  {perm.value}
                                </div>
                              </div>
                              {isGranted && (
                                <Check className="size-4 text-green-600 flex-shrink-0" />
                              )}
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center justify-between text-sm">
          <span className="text-blue-700 font-medium">Total Permissions Granted:</span>
          <span className="text-blue-900 font-bold">{currentPermissions.length}</span>
        </div>
        {usePresetRole && selectedRole && (
          <p className="mt-1 text-xs text-blue-600">
            Using preset role: {selectedRole}
          </p>
        )}
        {!usePresetRole && (
          <p className="mt-1 text-xs text-blue-600">
            Custom permission set
          </p>
        )}
      </div>
    </div>
  );
}

// Helper functions
function formatCategoryName(key: string): string {
  return key
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

function formatPermissionLabel(key: string): string {
  return key
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}
