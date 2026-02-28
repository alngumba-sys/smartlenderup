// Staff Permission Utilities

import { TabKey, TabPermission } from '../types/staff';

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
    return true;
  }
  
  try {
    const userData = localStorage.getItem('bvfunguo_user');
    if (userData) {
      const user = JSON.parse(userData);
      
      // Check staff permissions
      const permissions = user.permissions || [];
      
      // Handle object-based permissions (new format)
      if (!Array.isArray(permissions) && typeof permissions === 'object') {
        // Map tab keys to permission flags
        const tabPermissionMap: Record<TabKey, boolean> = {
          'dashboard': permissions.viewDashboard || false,
          'operations_loans': permissions.viewLoans || permissions.canAccessOperations || false,
          'operations_products': permissions.manageProducts || permissions.canAccessOperations || false,
          'operations_clients': permissions.viewClients || permissions.canAccessOperations || false,
          'operations_groups': permissions.canAccessOperations || false,
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
        
        return tabPermissionMap[tabKey] || false;
      }
      
      // Handle array-based permissions (old format)
      if (Array.isArray(permissions)) {
        const tabPermission = permissions.find((p: TabPermission) => p.tab_name === tabKey);
        return tabPermission ? tabPermission.can_view : false;
      }
      
      // Unknown format
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
          'operations_groups': permissions.canAccessOperations || false,
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
      
      // Check various role formats: Manager, manager, admin, organization_admin, etc.
      const role = (user.role || '').toLowerCase();
      const userType = (user.userType || '').toLowerCase();
      
      // Check for client role
      if (role === 'client' || userType === 'client') {
        return false; // Clients are never managers
      }
      
      // Check for manager/admin keywords in role
      if (role.includes('manager') || 
          role.includes('admin') || 
          userType.includes('manager') || 
          userType.includes('admin')) {
        return true;
      }
      
      // If userType is explicitly 'staff', they're not a manager
      if (userType === 'staff') {
        return false;
      }
      
      // If user has object-based permissions (staff member), they're not a manager
      // unless their permissions object is empty
      if (user.permissions && typeof user.permissions === 'object' && !Array.isArray(user.permissions)) {
        const hasAnyPermission = Object.keys(user.permissions).length > 0;
        return !hasAnyPermission; // Empty permissions object = manager
      }
      
      // If user has array-based permissions (staff member), they're not a manager
      // unless the array is empty
      if (Array.isArray(user.permissions)) {
        return user.permissions.length === 0; // Empty array = manager
      }
      
      // Default to manager if no permissions defined at all
      return !user.permissions;
    }
  } catch (error) {
    console.error('Error checking manager status:', error);
  }
  
  return true; // Default to true to avoid locking out users
}

// Get all tabs that user can view
export function getVisibleTabs(): TabKey[] {
  try {
    const userData = localStorage.getItem('bvfunguo_user');
    if (userData) {
      const user = JSON.parse(userData);
      if (user.role === 'manager' || user.userType === 'manager') {
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
  
  if (visibleTabs.length === 0) {
    return 'dashboard'; // Fallback
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
  
  const firstTabKey = visibleTabs[0];
  return tabKeyToRoute[firstTabKey] || 'dashboard';
}