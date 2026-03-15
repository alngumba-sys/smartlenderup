import { toast } from 'sonner';

export type TabKey = 
  | 'dashboard'
  | 'operations_loans'
  | 'operations_products'
  | 'operations_clients'
  | 'operations_institutions'
  | 'operations_calculator'
  | 'operations_approval'
  | 'operations_groups'
  | 'transactions_payments'
  | 'accounting_chart'
  | 'accounting_journal'
  | 'accounting_trial'
  | 'reports_par'
  | 'reports_collections'
  | 'reports_management'
  | 'payroll'
  | 'ai_tools'
  | 'settings';

export interface TabPermission {
  tab_name: string;
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
}

// Permission error message
export const PERMISSION_ERROR_MESSAGE = "CAUTION!! You do not have permission to carry out this task";

// Show permission denied error
export function showPermissionError(): void {
  toast.error(PERMISSION_ERROR_MESSAGE, {
    duration: 4000,
    style: {
      background: '#FEE2E2',
      border: '1px solid #DC2626',
      color: '#991B1B',
    },
  });
}

// Get current user's permissions from localStorage
export function getCurrentUserPermissions(): TabPermission[] {
  try {
    const userData = localStorage.getItem('bvfunguo_user');
    if (userData) {
      const user = JSON.parse(userData);
      const permissions = user.permissions || [];
      return Array.isArray(permissions) ? permissions : [];
    }
  } catch (error) {
    console.error('Error getting user permissions:', error);
  }
  return [];
}

// Check if user can view a specific tab
export function canViewTab(tabKey: TabKey): boolean {
  // Check if user is manager (full access)
  if (isManager()) {
    console.log(`[canViewTab] ${tabKey}: ✅ User is manager`);
    return true;
  }
  
  try {
    const userData = localStorage.getItem('bvfunguo_user');
    if (userData) {
      const user = JSON.parse(userData);
      
      // Check for GRANULAR PERMISSIONS first
      let granularPermissions = user.granular_permissions;
      
      // Parse if it's a string (for backwards compatibility with already-logged-in users)
      if (typeof granularPermissions === 'string') {
        try {
          granularPermissions = JSON.parse(granularPermissions);
        } catch (e) {
          console.error('[canViewTab] Failed to parse granular_permissions:', e);
          granularPermissions = null;
        }
      }
      
      if (granularPermissions && granularPermissions.useGranularPermissions === true) {
        console.log(`[canViewTab] ${tabKey}: Using GRANULAR permissions`, granularPermissions);
        console.log(`[canViewTab] ${tabKey}: Full granularPermissions object:`, JSON.stringify(granularPermissions, null, 2));
        
        // Get the custom permissions array
        const customPermissions: string[] = granularPermissions.customPermissions || [];
        console.log(`[canViewTab] ${tabKey}: Custom permissions array:`, customPermissions);
        console.log(`[canViewTab] ${tabKey}: Custom permissions count:`, customPermissions.length);
        
        // Map tab keys to required granular permissions
        const tabToGranularMap: Record<TabKey, string[]> = {
          'dashboard': ['dashboard.view'],
          'operations_loans': ['loans.view'],
          'operations_products': ['loan_products.view'],
          'operations_clients': ['clients.view'],
          'operations_institutions': ['institutions.view'],
          'operations_calculator': ['loans.view'], // Calculator requires loans view
          'operations_approval': ['approvals.view'],
          'operations_groups': ['groups.view'], // Groups have their own permissions
          'transactions_payments': ['payments.view', 'repayments.view'], // Payments OR Repayments
          'accounting_chart': ['accounting.view'],
          'accounting_journal': ['accounting.view'],
          'accounting_trial': ['accounting.view'],
          'reports_par': ['reports.view'],
          'reports_collections': ['collection_sheets.view'],
          'reports_management': ['reports.view'],
          'payroll': ['payroll.view'],
          'ai_tools': ['credit_scoring.view', 'ai_insights.view'], // Credit Scoring OR AI Insights
          'settings': ['settings.view'],
        };
        
        // Check if user has any of the required permissions
        const requiredPerms = tabToGranularMap[tabKey] || [];
        const hasPermission = requiredPerms.some(perm => {
          const has = customPermissions.includes(perm);
          console.log(`[canViewTab] ${tabKey}: Checking '${perm}': ${has ? '✅' : '❌'}`);
          return has;
        });
        
        console.log(`[canViewTab] ${tabKey}: ${hasPermission ? '✅ GRANTED' : '❌ DENIED'} (granular)`, {
          requiredPerms,
          customPermissions,
          hasPermission
        });
        
        return hasPermission;
      }
      
      // Check staff permissions (fallback to old system)
      const permissions = user.permissions || [];
      
      console.log(`[canViewTab] ${tabKey}: Checking permissions`, {
        isArray: Array.isArray(permissions),
        isObject: !Array.isArray(permissions) && typeof permissions === 'object',
        permissions
      });
      
      // Handle object-based permissions (new format)
      if (!Array.isArray(permissions) && typeof permissions === 'object') {
        // Map tab keys to permission flags
        const tabPermissionMap: Record<TabKey, boolean> = {
          'dashboard': permissions.viewDashboard || false,
          'operations_loans': permissions.viewLoans || permissions.canAccessOperations || false,
          'operations_products': permissions.manageProducts || permissions.canAccessOperations || false,
          'operations_clients': permissions.viewClients || permissions.canAccessOperations || false,
          'operations_institutions': permissions.viewClients || permissions.canAccessOperations || false,
          'operations_calculator': permissions.viewLoans || permissions.canAccessOperations || false,
          'operations_approval': permissions.approveLoans || permissions.canAccessOperations || false,
          'operations_groups': permissions.canAccessOperations || false,
          'transactions_payments': permissions.viewTransactions || permissions.canAccessTransactions || false,
          'accounting_chart': permissions.viewTransactions || permissions.canAccessTransactions || false,
          'accounting_journal': permissions.viewTransactions || permissions.canAccessTransactions || false,
          'accounting_trial': permissions.viewTransactions || permissions.canAccessTransactions || false,
          'reports_par': permissions.viewPortfolioReport || permissions.viewLoanPerformanceReport || false,
          'reports_collections': permissions.viewCollectionReport || false,
          'reports_management': permissions.viewClientReport || permissions.viewFinancialReport || false,
          'payroll': permissions.canAccessManagement || false,
          'ai_tools': permissions.viewRiskInsights || permissions.canAccessRiskAI || false,
          'settings': permissions.canAccessAdmin || false,
        };
        
        const result = tabPermissionMap[tabKey] || false;
        console.log(`[canViewTab] ${tabKey}: ${result ? '✅' : '❌'}`, {
          viewDashboard: permissions.viewDashboard,
          viewLoans: permissions.viewLoans,
          canAccessOperations: permissions.canAccessOperations,
          addLoans: permissions.addLoans
        });
        return result;
      }
      
      // Handle array-based permissions (old format)
      if (Array.isArray(permissions)) {
        const tabPermission = permissions.find((p: TabPermission) => p.tab_name === tabKey);
        const result = tabPermission ? tabPermission.can_view : false;
        console.log(`[canViewTab] ${tabKey}: ${result ? '✅' : '❌'} (array format)`);
        return result;
      }
      
      // Unknown format
      console.log(`[canViewTab] ${tabKey}: ❌ Unknown format`);
      return false;
    }
  } catch (error) {
    console.error('Error checking view permission:', error);
  }
  return false;
}

// Check if user can edit in a specific tab
export function canEditInTab(tabKey: TabKey): boolean {
  // Check if user is manager (full access)
  if (isManager()) {
    return true;
  }
  
  try {
    const userData = localStorage.getItem('bvfunguo_user');
    if (userData) {
      const user = JSON.parse(userData);
      
      const permissions = user.permissions || [];
      
      // Handle object-based permissions (new format)
      if (!Array.isArray(permissions) && typeof permissions === 'object') {
        // Map tab keys to edit permission flags
        const tabEditPermissionMap: Record<TabKey, boolean> = {
          'dashboard': false, // Dashboard is view-only
          'operations_loans': permissions.addLoans || permissions.approveLoans || false,
          'operations_products': permissions.manageProducts || false,
          'operations_clients': permissions.editClients || permissions.addClients || false,
          'operations_institutions': permissions.editClients || permissions.addClients || false,
          'operations_calculator': false, // Calculator is view-only
          'operations_approval': permissions.approveLoans || false,
          'operations_groups': permissions.canAccessOperations || false,
          'transactions_payments': permissions.canAccessTransactions || false,
          'accounting_chart': permissions.canAccessTransactions || false,
          'accounting_journal': permissions.canAccessTransactions || false,
          'accounting_trial': false, // Trial balance is view-only
          'reports_par': false, // Reports are view-only
          'reports_collections': false,
          'reports_management': false,
          'payroll': permissions.canAccessManagement || false,
          'ai_tools': false, // AI tools are view-only
          'settings': permissions.canAccessAdmin || false,
        };
        
        return tabEditPermissionMap[tabKey] || false;
      }
      
      // Handle array-based permissions (old format)
      if (Array.isArray(permissions)) {
        const tabPermission = permissions.find((p: TabPermission) => p.tab_name === tabKey);
        return tabPermission ? tabPermission.can_edit : false;
      }
      
      // Unknown format
      return false;
    }
  } catch (error) {
    console.error('Error checking edit permission:', error);
  }
  return false;
}

// Check if user can create in a specific tab
export function canCreateInTab(tabKey: TabKey): boolean {
  // Check if user is manager (full access)
  if (isManager()) {
    return true;
  }
  
  try {
    const userData = localStorage.getItem('bvfunguo_user');
    if (userData) {
      const user = JSON.parse(userData);
      
      const permissions = user.permissions || [];
      
      // Handle object-based permissions (new format)
      if (!Array.isArray(permissions) && typeof permissions === 'object') {
        // Map tab keys to create permission flags
        const tabCreatePermissionMap: Record<TabKey, boolean> = {
          'dashboard': false, // Dashboard has no create
          'operations_loans': permissions.addLoans || false,
          'operations_products': permissions.manageProducts || false,
          'operations_clients': permissions.addClients || false,
          'operations_groups': permissions.canAccessOperations || false,
          'accounting_chart': permissions.canAccessTransactions || false,
          'accounting_journal': permissions.canAccessTransactions || false,
          'accounting_trial': false, // Trial balance has no create
          'reports_par': false, // Reports have no create
          'reports_collections': false,
          'reports_management': false,
          'payroll': permissions.canAccessManagement || false,
          'ai_tools': false, // AI tools have no create
          'settings': permissions.canAccessAdmin || false,
        };
        
        return tabCreatePermissionMap[tabKey] || false;
      }
      
      // Handle array-based permissions (new format with can_create)
      if (Array.isArray(permissions)) {
        const tabPermission = permissions.find((p: TabPermission) => p.tab_name === tabKey);
        return tabPermission ? (tabPermission.can_create || false) : false;
      }
      
      // Unknown format
      return false;
    }
  } catch (error) {
    console.error('Error checking create permission:', error);
  }
  return false;
}

// Check if user can delete in a specific tab
export function canDeleteInTab(tabKey: TabKey): boolean {
  // Check if user is manager (full access)
  if (isManager()) {
    return true;
  }
  
  try {
    const userData = localStorage.getItem('bvfunguo_user');
    if (userData) {
      const user = JSON.parse(userData);
      
      const permissions = user.permissions || [];
      
      // Handle object-based permissions (new format)
      if (!Array.isArray(permissions) && typeof permissions === 'object') {
        // Map tab keys to delete permission flags
        const tabDeletePermissionMap: Record<TabKey, boolean> = {
          'dashboard': false, // Dashboard has no delete
          'operations_loans': false, // Loans typically can't be deleted
          'operations_products': permissions.manageProducts || false,
          'operations_clients': permissions.deleteClients || false,
          'operations_groups': permissions.canAccessOperations || false,
          'accounting_chart': false, // Chart of accounts managed separately
          'accounting_journal': false, // Transactions can't be deleted
          'accounting_trial': false,
          'reports_par': false,
          'reports_collections': false,
          'reports_management': false,
          'payroll': permissions.canAccessManagement || false,
          'ai_tools': false,
          'settings': permissions.canAccessAdmin || false,
        };
        
        return tabDeletePermissionMap[tabKey] || false;
      }
      
      // Handle array-based permissions (old format)
      if (Array.isArray(permissions)) {
        const tabPermission = permissions.find((p: TabPermission) => p.tab_name === tabKey);
        return tabPermission ? tabPermission.can_delete : false;
      }
      
      // Unknown format
      return false;
    }
  } catch (error) {
    console.error('Error checking delete permission:', error);
  }
  return false;
}

// Check if current user is a manager
export function isManager(): boolean {
  try {
    const userData = localStorage.getItem('bvfunguo_user');
    if (userData) {
      const user = JSON.parse(userData);
      
      // IMPORTANT: If user has granular permissions enabled, they are NOT a manager
      // (even if their role field says "Manager") - custom permissions take precedence
      let granularPerms = user.granular_permissions || user.granularPermissions;
      if (typeof granularPerms === 'string') {
        try {
          granularPerms = JSON.parse(granularPerms);
        } catch (e) {
          granularPerms = null;
        }
      }
      
      if (granularPerms && granularPerms.useGranularPermissions === true) {
        console.log('[isManager] ❌ User has custom granular permissions - NOT treated as manager');
        return false; // Custom permissions override manager status
      }
      
      // Check various role formats: Manager, manager, admin, organization_admin, etc.
      const role = (user.role || '').toLowerCase();
      const userType = (user.userType || '').toLowerCase();
      
      console.log('[isManager] Checking manager status:', {
        role,
        userType,
        hasPermissions: !!user.permissions,
        permissionsType: Array.isArray(user.permissions) ? 'array' : typeof user.permissions,
        permissionsCount: Array.isArray(user.permissions) ? user.permissions.length : (user.permissions ? Object.keys(user.permissions).length : 0)
      });
      
      // Check for client role
      if (role === 'client' || userType === 'client') {
        console.log('[isManager] ❌ User is client');
        return false; // Clients are never managers
      }
      
      // Check for manager/admin keywords in role
      if (role.includes('manager') || 
          role.includes('admin') || 
          userType.includes('manager') || 
          userType.includes('admin')) {
        console.log('[isManager] ✅ User has manager/admin role');
        return true;
      }
      
      // If userType is explicitly 'staff', they're not a manager
      if (userType === 'staff') {
        console.log('[isManager] ❌ User is staff (not manager)');
        return false;
      }
      
      // If user has object-based permissions (staff member), they're not a manager
      // unless their permissions object is empty
      if (user.permissions && typeof user.permissions === 'object' && !Array.isArray(user.permissions)) {
        const hasAnyPermission = Object.keys(user.permissions).length > 0;
        const result = !hasAnyPermission; // Empty permissions object = manager
        console.log(`[isManager] ${result ? '✅' : '❌'} Object permissions (${Object.keys(user.permissions).length} keys)`);
        return result;
      }
      
      // If user has array-based permissions (staff member), they're not a manager
      // unless the array is empty
      if (Array.isArray(user.permissions)) {
        const result = user.permissions.length === 0; // Empty array = manager
        console.log(`[isManager] ${result ? '✅' : '❌'} Array permissions (${user.permissions.length} items)`);
        return result;
      }
      
      // Default to manager if no permissions defined at all
      console.log('[isManager] ⚠️ No permissions defined - defaulting to manager');
      return !user.permissions;
    }
  } catch (error) {
    console.error('Error checking manager status:', error);
  }
  
  console.log('[isManager] ⚠️ No user data - defaulting to FALSE (no access)');
  return false; // ✅ FIXED: Default to false to deny access when not logged in
}

// Get all tabs that user can view
export function getVisibleTabs(): TabKey[] {
  try {
    const userData = localStorage.getItem('bvfunguo_user');
    if (userData) {
      const user = JSON.parse(userData);
      // Check if user is a manager/admin (case-insensitive)
      const role = (user.role || '').toLowerCase();
      const userType = (user.userType || '').toLowerCase();
      
      if (role.includes('manager') || role.includes('admin') || 
          userType.includes('manager') || userType.includes('admin')) {
        // Managers can see all tabs
        return [
          'dashboard',
          'operations_loans',
          'operations_products',
          'operations_clients',
          'operations_groups',
          'accounting_chart',
          'accounting_journal',
          'accounting_trial',
          'reports_par',
          'reports_collections',
          'reports_management',
          'payroll',
          'ai_tools',
          'settings',
        ];
      }
      
      // ✅ CHECK FOR GRANULAR PERMISSIONS FIRST (same logic as canViewTab)
      let granularPermissions = user.granular_permissions;
      
      // Parse if it's a string
      if (typeof granularPermissions === 'string') {
        try {
          granularPermissions = JSON.parse(granularPermissions);
        } catch (e) {
          console.error('[getVisibleTabs] Failed to parse granular_permissions:', e);
          granularPermissions = null;
        }
      }
      
      if (granularPermissions && granularPermissions.useGranularPermissions === true) {
        console.log('[getVisibleTabs] Using GRANULAR permissions system');
        
        const customPermissions: string[] = granularPermissions.customPermissions || [];
        const visibleTabs: TabKey[] = [];
        
        // Map tab keys to required granular permissions (same as canViewTab)
        const tabToGranularMap: Record<TabKey, string[]> = {
          'dashboard': ['dashboard.view'],
          'operations_loans': ['loans.view'],
          'operations_products': ['loan_products.view'],
          'operations_clients': ['clients.view'],
          'operations_institutions': ['institutions.view'],
          'operations_calculator': ['loans.view'],
          'operations_approval': ['approvals.view'],
          'operations_groups': ['groups.view'],
          'transactions_payments': ['payments.view', 'repayments.view'],
          'accounting_chart': ['accounting.view'],
          'accounting_journal': ['accounting.view'],
          'accounting_trial': ['accounting.view'],
          'reports_par': ['reports.view'],
          'reports_collections': ['collection_sheets.view'],
          'reports_management': ['reports.view'],
          'payroll': ['payroll.view'],
          'ai_tools': ['credit_scoring.view', 'ai_insights.view'],
          'settings': ['settings.view'],
        };
        
        // Check each tab
        for (const [tabKey, requiredPerms] of Object.entries(tabToGranularMap)) {
          const hasPermission = requiredPerms.some(perm => customPermissions.includes(perm));
          if (hasPermission) {
            visibleTabs.push(tabKey as TabKey);
          }
        }
        
        console.log('[getVisibleTabs] Visible tabs with granular permissions:', visibleTabs);
        return visibleTabs;
      }
      
      // Staff can only see tabs they have view permission for
      const permissions = user.permissions || {};
      
      // Handle object-based permissions (new format)
      if (!Array.isArray(permissions) && typeof permissions === 'object') {
        const visibleTabs: TabKey[] = [];
        
        // Map permission flags to tabs
        if (permissions.viewDashboard) {
          visibleTabs.push('dashboard');
        }
        
        // Operations tabs
        if (permissions.canAccessOperations || permissions.viewLoans) {
          visibleTabs.push('operations_loans');
        }
        if (permissions.canAccessOperations || permissions.manageProducts) {
          visibleTabs.push('operations_products');
        }
        if (permissions.canAccessOperations || permissions.viewClients) {
          visibleTabs.push('operations_clients');
        }
        if (permissions.canAccessOperations) {
          visibleTabs.push('operations_groups');
        }
        
        // Accounting tabs
        if (permissions.canAccessTransactions || permissions.viewTransactions) {
          visibleTabs.push('accounting_chart');
          visibleTabs.push('accounting_journal');
          visibleTabs.push('accounting_trial');
        }
        
        // Reports tabs
        if (permissions.viewPortfolioReport || permissions.viewLoanPerformanceReport || 
            permissions.viewCollectionReport || permissions.viewClientReport) {
          visibleTabs.push('reports_par');
          visibleTabs.push('reports_collections');
          visibleTabs.push('reports_management');
        }
        
        // Payroll
        if (permissions.canAccessManagement) {
          visibleTabs.push('payroll');
        }
        
        // AI Tools
        if (permissions.canAccessRiskAI || permissions.viewRiskInsights) {
          visibleTabs.push('ai_tools');
        }
        
        // Settings - only admins
        if (permissions.canAccessAdmin) {
          visibleTabs.push('settings');
        }
        
        return visibleTabs.length > 0 ? visibleTabs : ['dashboard'];
      }
      
      // Handle array-based permissions (old format)
      if (Array.isArray(permissions)) {
        return permissions
          .filter((p: TabPermission) => p.can_view)
          .map((p: TabPermission) => p.tab_name as TabKey);
      }
      
      // Unknown permissions format - return dashboard only
      return ['dashboard'];
    }
  } catch (error) {
    console.error('Error getting visible tabs:', error);
  }
  return ['dashboard']; // Default to dashboard only
}

// Get the first visible tab for navigation (tab route value, not tabKey)
export function getFirstVisibleTabRoute(): string {
  const visibleTabs = getVisibleTabs();
  
  console.log('🎯 [getFirstVisibleTabRoute] Visible tabs:', visibleTabs);
  
  if (visibleTabs.length === 0) {
    console.warn('⚠️ [getFirstVisibleTabRoute] No visible tabs found! Defaulting to dashboard');
    return 'dashboard'; // Changed from 'loans' to 'dashboard' as fallback
  }
  
  // Map tabKeys to their navigation routes
  const tabKeyToRoute: Record<string, string> = {
    'dashboard': 'dashboard',
    'operations_loans': 'loans',
    'operations_products': 'loan-products',
    'operations_clients': 'clients',
    'operations_groups': 'groups',
    'accounting_chart': 'accounting',
    'accounting_journal': 'accounting',
    'accounting_trial': 'accounting',
    'reports_par': 'reports',
    'reports_collections': 'reports',
    'reports_management': 'reports',
    'payroll': 'payroll',
    'ai_tools': 'ai-insights',
    'settings': 'settings',
  };
  
  // ✅ REQUIREMENT: If Dashboard is disabled, set landing page to Loans
  const hasDashboard = visibleTabs.includes('dashboard');
  
  if (!hasDashboard && visibleTabs.length > 0) {
    console.log('📍 Dashboard disabled - using first visible tab:', visibleTabs[0]);
    const firstTabKey = visibleTabs[0];
    const route = tabKeyToRoute[firstTabKey] || 'dashboard';
    console.log('🎯 [getFirstVisibleTabRoute] Returning route:', route);
    return route;
  }
  
  const firstTabKey = visibleTabs[0];
  const route = tabKeyToRoute[firstTabKey] || 'dashboard';
  console.log('🎯 [getFirstVisibleTabRoute] Returning route:', route);
  return route;
}