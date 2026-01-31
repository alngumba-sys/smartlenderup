// Staff Permission Utilities

import { TabKey, TabPermission } from '../types/staff';

// Get current user's permissions from localStorage
export function getCurrentUserPermissions(): TabPermission[] {
  try {
    const userData = localStorage.getItem('bvfunguo_user');
    if (userData) {
      const user = JSON.parse(userData);
      return user.permissions || [];
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
      const tabPermission = permissions.find((p: TabPermission) => p.tab_name === tabKey);
      return tabPermission ? tabPermission.can_view : false;
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
      const tabPermission = permissions.find((p: TabPermission) => p.tab_name === tabKey);
      return tabPermission ? tabPermission.can_edit : false;
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
      const tabPermission = permissions.find((p: TabPermission) => p.tab_name === tabKey);
      return tabPermission ? tabPermission.can_delete : false;
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
      console.log('🔍 isManager check:', { 
        role: user.role, 
        userType: user.userType, 
        hasPermissions: !!user.permissions,
        permissionsLength: user.permissions?.length || 0 
      });
      
      // Check various role formats: Manager, manager, admin, organization_admin, etc.
      const role = (user.role || '').toLowerCase();
      const userType = (user.userType || '').toLowerCase();
      
      // If user doesn't have a permissions array or userType is not 'staff', they're a manager
      if (!user.permissions || user.permissions.length === 0) {
        console.log('✅ isManager = true (no permissions defined)');
        return true; // Default to manager if no permissions defined
      }
      
      if (userType === 'staff') {
        console.log('❌ isManager = false (userType is staff)');
        return false; // Explicitly staff user
      }
      
      // Check for manager/admin keywords
      const isManagerOrAdmin = role.includes('manager') || 
             role.includes('admin') || 
             userType.includes('manager') || 
             userType.includes('admin');
      
      console.log(`${isManagerOrAdmin ? '✅' : '❌'} isManager = ${isManagerOrAdmin} (keyword check)`);
      return isManagerOrAdmin;
    }
  } catch (error) {
    console.error('Error checking manager status:', error);
  }
  console.log('✅ isManager = true (default fallback)');
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
      
      console.warn('Permissions format not recognized:', permissions);
      return ['dashboard']; // Default to dashboard only
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